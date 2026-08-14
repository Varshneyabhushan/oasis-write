import { Node, mergeAttributes } from '@tiptap/core';
import type MarkdownIt from 'markdown-it';
import type { MarkdownSerializerState } from 'prosemirror-markdown';
import type { Node as PMNode } from '@tiptap/pm/model';

/**
 * YAML front matter — the `---` delimited metadata block that may open a
 * markdown file (Claude Code skills, Jekyll/Hugo posts, note trackers).
 *
 * Without this extension the block is not front matter to the parser at all:
 * `---` becomes a thematic break and the YAML body becomes an ordinary
 * paragraph. Round-tripping that through the serializer collapses the lines
 * into one and escapes markdown-significant characters, so `topics: [a, b]`
 * comes back as `topics: \[a, b\]` and the file stops parsing as YAML. Because
 * auto-save writes the serialized buffer back to disk, simply *opening* a file
 * was enough to destroy its front matter.
 *
 * The block is modelled like a code block: a text-only, `code: true` node so
 * whitespace and line breaks survive and no input rules or smart-typography
 * substitutions fire inside it.
 */

/** Opening/closing fence for a front matter block. */
const FENCE = '---';

/** YAML also permits `...` as an end-of-document marker. */
const CLOSING_FENCES = new Set([FENCE, '...']);

/**
 * Render a front matter body back to markdown source.
 *
 * Kept separate from the serializer so it can be tested without standing up a
 * ProseMirror schema, and so the fence is defined in exactly one place.
 */
export function frontmatterToMarkdown(body: string): string {
  // A trailing newline in the body would produce a blank line before the
  // closing fence, which YAML tolerates but which churns the file on every
  // save. Normalise it away.
  return `${FENCE}\n${body.replace(/\n+$/, '')}\n${FENCE}`;
}

/**
 * markdown-it block rule recognising front matter.
 *
 * Registered *before* `hr` because `---` would otherwise be consumed as a
 * thematic break. Front matter is only front matter on the first line of the
 * document — a `---` anywhere else stays a thematic break.
 */
export function frontmatterMarkdownIt(md: MarkdownIt): void {
  md.block.ruler.before(
    'hr',
    'frontmatter',
    (state, startLine, endLine, silent) => {
      // Must be the very first line of the document, at the top level.
      if (startLine !== 0 || state.blkIndent !== 0 || state.parentType !== 'root') {
        return false;
      }

      const lineAt = (line: number) =>
        state.src.slice(state.bMarks[line] + state.tShift[line], state.eMarks[line]);

      if (lineAt(startLine).trim() !== FENCE) return false;

      // Find the closing fence. An unterminated block is not front matter —
      // leave it to `hr` so the document still renders the way the author sees it.
      let closingLine = startLine + 1;
      for (; closingLine < endLine; closingLine++) {
        if (CLOSING_FENCES.has(lineAt(closingLine).trim())) break;
      }
      if (closingLine >= endLine) return false;

      if (silent) return true;

      const token = state.push('frontmatter', '', 0);
      token.block = true;
      token.markup = FENCE;
      token.map = [startLine, closingLine + 1];
      token.content = state.getLines(startLine + 1, closingLine, 0, false);

      state.line = closingLine + 1;
      return true;
    },
    // `alt: []` — front matter never interrupts another block, so there is no
    // context in which this rule should be retried as a paragraph terminator.
    { alt: [] },
  );

  // tiptap-markdown parses by rendering to HTML and feeding it to ProseMirror's
  // DOM parser, so the rule needs a matching renderer. The markup mirrors
  // `renderHTML` below so `parseHTML` picks it up.
  md.renderer.rules.frontmatter = (tokens, idx) =>
    `<pre data-frontmatter="true"><code>${md.utils.escapeHtml(tokens[idx].content)}</code></pre>\n`;
}

export const Frontmatter = Node.create({
  name: 'frontmatter',

  // Above the default (100) so this node's `pre[data-frontmatter]` rule is
  // offered to ProseMirror's DOM parser before the code block's bare `pre`,
  // which would otherwise swallow it.
  priority: 1000,

  group: 'block',
  content: 'text*',
  marks: '',
  // `code` keeps whitespace (ProseMirror defaults `whitespace` to "pre" for code
  // nodes) and makes Enter insert a newline rather than splitting the block.
  code: true,
  defining: true,
  // Front matter is a single opaque unit: never merge it with a neighbouring
  // block or let a paste split it in two.
  isolating: true,

  parseHTML() {
    return [
      {
        tag: 'pre[data-frontmatter]',
        preserveWhitespace: 'full',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'pre',
      mergeAttributes({ 'data-frontmatter': 'true' }, HTMLAttributes),
      ['code', {}, 0],
    ];
  },

  addKeyboardShortcuts() {
    return {
      // Front matter is usually the first node in the document, so without an
      // explicit escape hatch there is no way to put the caret above it or to
      // start the prose below an unterminated document.
      'Mod-Enter': () => this.editor.commands.exitCode(),
      'Shift-Enter': () => this.editor.commands.exitCode(),
    };
  },

  addStorage() {
    return {
      markdown: {
        serialize(
          state: MarkdownSerializerState,
          node: PMNode,
          _parent: PMNode,
          index: number,
        ) {
          // Front matter is only front matter at the top of the file. If the
          // node ends up elsewhere (paste, or the block above it was deleted),
          // emit a YAML code fence instead — `---` mid-document would re-parse
          // as a thematic break and the body would be silently mangled.
          if (index !== 0) {
            state.write('```yaml\n');
            state.text(node.textContent, false);
            state.ensureNewLine();
            state.write('```');
            state.closeBlock(node);
            return;
          }

          // `state.text(..., false)` writes verbatim. The escaping variant is
          // what turns `[dynamic-programming]` into `\[dynamic-programming\]`.
          state.write(`${FENCE}\n`);
          state.text(node.textContent, false);
          state.ensureNewLine();
          state.write(FENCE);
          state.closeBlock(node);
        },
        parse: {
          setup(markdownit: MarkdownIt) {
            markdownit.use(frontmatterMarkdownIt);
          },
        },
      },
    };
  },
});

export default Frontmatter;
