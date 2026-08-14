// @vitest-environment happy-dom
import { describe, it, expect, afterEach } from 'vitest';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import { Frontmatter } from '../Frontmatter';

/**
 * The round trip that matters: markdown on disk -> ProseMirror document ->
 * markdown written back. Auto-save persists the second value, so anything this
 * test lets drift is a file the editor silently rewrites.
 */

const editors: Editor[] = [];

function roundTrip(markdown: string): string {
  const editor = new Editor({
    extensions: [StarterKit, Frontmatter, Markdown.configure({ html: false })],
    content: markdown,
  });
  editors.push(editor);
  // @ts-ignore - tiptap-markdown adds this to storage
  return editor.storage.markdown.getMarkdown();
}

afterEach(() => {
  while (editors.length) editors.pop()?.destroy();
});

const TRACKER_FILE = `---
title: House Robber II
topics: [dynamic-programming, practice]
status: review
link: https://leetcode.com/problems/house-robber-ii/
legacy_repeats: 0
attempts:
  - 2026-08-13 | 14 min | solved | two runs of the linear recurrence
---

# House Robber II`;

describe('front matter round trip', () => {
  it('returns a tracker file unchanged', () => {
    expect(roundTrip(TRACKER_FILE)).toBe(TRACKER_FILE);
  });

  it('does not escape brackets in the YAML body', () => {
    const output = roundTrip(TRACKER_FILE);
    expect(output).toContain('topics: [dynamic-programming, practice]');
    expect(output).not.toContain('\\[');
  });

  it('keeps the YAML on separate lines', () => {
    const output = roundTrip(TRACKER_FILE);
    expect(output).toContain('title: House Robber II\ntopics:');
  });

  it('parses front matter into a single frontmatter node at the top', () => {
    const editor = new Editor({
      extensions: [StarterKit, Frontmatter, Markdown.configure({ html: false })],
      content: TRACKER_FILE,
    });
    editors.push(editor);

    const first = editor.state.doc.firstChild;
    expect(first?.type.name).toBe('frontmatter');
    expect(first?.textContent).toContain('status: review');

    let count = 0;
    editor.state.doc.descendants((node) => {
      if (node.type.name === 'frontmatter') count++;
    });
    expect(count).toBe(1);
  });

  it('leaves a document without front matter alone', () => {
    const plain = '# Title\n\nSome prose with a [link](https://example.com).';
    expect(roundTrip(plain)).toBe(plain);
  });

  it('still treats a mid-document --- as a thematic break', () => {
    const withRule = 'Above.\n\n---\n\nBelow.';
    const output = roundTrip(withRule);
    expect(output).not.toContain('data-frontmatter');
    expect(output).toContain('---');
  });

  it('preserves an empty front matter body without crashing', () => {
    const output = roundTrip('---\n---\n\nBody');
    expect(output).toContain('Body');
  });
});
