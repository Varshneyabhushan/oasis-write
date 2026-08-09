import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';

// How long the button stays in its "copied" state before reverting
const COPIED_FEEDBACK_MS = 1500;

const COPY_ICON = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="5.5" y="5.5" width="8" height="9" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M10.5 3.5V3C10.5 2.17157 9.82843 1.5 9 1.5H4C3.17157 1.5 2.5 2.17157 2.5 3V10C2.5 10.8284 3.17157 11.5 4 11.5H4.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`;

const COPIED_ICON = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8.5L6.5 12L13 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// navigator.clipboard is unavailable in webviews that don't count as a secure
// context, so fall back to a throwaway textarea + execCommand.
async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the legacy path
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    document.body.removeChild(textarea);
    return copied;
  } catch {
    return false;
  }
}

/**
 * CodeBlockLowlight with a copy button in the top-right corner of each block.
 *
 * The node view wraps `<pre>` in a positioned container so the button stays put
 * while the code scrolls horizontally. The button lives outside `contentDOM`,
 * so it never becomes part of the document content or the serialized markdown.
 */
export const CodeBlockWithCopy = CodeBlockLowlight.extend({
  addNodeView() {
    return ({ node, HTMLAttributes }) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper';

      const pre = document.createElement('pre');
      Object.entries(HTMLAttributes).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          pre.setAttribute(key, String(value));
        }
      });

      const code = document.createElement('code');
      const language = node.attrs.language;
      if (language) {
        code.classList.add(`${this.options.languageClassPrefix}${language}`);
      }

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'code-copy-button';
      button.contentEditable = 'false';
      button.innerHTML = COPY_ICON;
      button.title = 'Copy code';
      button.setAttribute('aria-label', 'Copy code');

      let resetTimer: ReturnType<typeof setTimeout> | undefined;

      button.addEventListener('mousedown', (event) => {
        // Keep the caret where it is instead of focusing the button
        event.preventDefault();
      });

      button.addEventListener('click', async (event) => {
        event.preventDefault();
        event.stopPropagation();

        const copied = await copyText(code.textContent ?? '');

        button.innerHTML = copied ? COPIED_ICON : COPY_ICON;
        button.classList.toggle('copied', copied);
        button.title = copied ? 'Copied' : 'Copy failed';
        button.setAttribute('aria-label', button.title);

        clearTimeout(resetTimer);
        resetTimer = setTimeout(() => {
          button.innerHTML = COPY_ICON;
          button.classList.remove('copied');
          button.title = 'Copy code';
          button.setAttribute('aria-label', 'Copy code');
        }, COPIED_FEEDBACK_MS);
      });

      pre.appendChild(code);
      wrapper.appendChild(button);
      wrapper.appendChild(pre);

      return {
        dom: wrapper,
        contentDOM: code,
        update: (updatedNode) => {
          if (updatedNode.type !== node.type) return false;

          const nextLanguage = updatedNode.attrs.language;
          if (nextLanguage !== language) {
            // Language changes come with fresh highlight decorations; let
            // ProseMirror rebuild the node view rather than patching classes.
            return false;
          }

          return true;
        },
        // The button is ours, not document content - PM should ignore both its
        // DOM mutations and its events.
        ignoreMutation: (mutation) => {
          if (mutation.type === 'selection') return false;
          return !code.contains(mutation.target);
        },
        stopEvent: (event) => {
          const target = event.target;
          return target instanceof globalThis.Node && button.contains(target);
        },
        destroy: () => {
          clearTimeout(resetTimer);
        },
      };
    };
  },
});

export default CodeBlockWithCopy;
