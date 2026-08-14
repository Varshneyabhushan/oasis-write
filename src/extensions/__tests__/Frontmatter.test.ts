import { describe, it, expect } from 'vitest';
import MarkdownIt from 'markdown-it';
import { frontmatterMarkdownIt, frontmatterToMarkdown } from '../Frontmatter';

const md = () => new MarkdownIt().use(frontmatterMarkdownIt);

// The tracker files that exposed the bug: YAML with bracketed lists, URLs and
// colons, opening the document.
const TRACKER_FILE = `---
title: House Robber II
topics: [dynamic-programming, practice]
status: review
link: https://leetcode.com/problems/house-robber-ii/
attempts:
  - 2026-08-13 | 14 min | solved | two runs of the linear recurrence
---

# House Robber II
`;

describe('frontmatterMarkdownIt', () => {
  it('parses a leading --- block as front matter, not a thematic break', () => {
    const html = md().render(TRACKER_FILE);
    expect(html).toContain('<pre data-frontmatter="true">');
    expect(html).not.toContain('<hr>');
  });

  it('keeps the YAML body verbatim, including brackets', () => {
    const html = md().render(TRACKER_FILE);
    expect(html).toContain('topics: [dynamic-programming, practice]');
    // The corruption signature: markdown escaping applied to YAML.
    expect(html).not.toContain('\\[');
  });

  it('preserves line structure rather than collapsing to a paragraph', () => {
    const html = md().render(TRACKER_FILE);
    const body = html.slice(
      html.indexOf('<code>') + '<code>'.length,
      html.indexOf('</code>'),
    );
    expect(body.split('\n')).toHaveLength(6);
    expect(body.startsWith('title: House Robber II')).toBe(true);
  });

  it('leaves the rest of the document alone', () => {
    const html = md().render(TRACKER_FILE);
    expect(html).toContain('<h1>House Robber II</h1>');
  });

  it('accepts ... as a closing fence', () => {
    const html = md().render('---\ntitle: x\n...\n\nbody\n');
    expect(html).toContain('<pre data-frontmatter="true">');
  });

  it('ignores --- that is not on the first line', () => {
    const html = md().render('# Heading\n\n---\ntitle: x\n---\n');
    expect(html).not.toContain('data-frontmatter');
    expect(html).toContain('<hr>');
  });

  it('ignores an unterminated block so the document still renders', () => {
    const html = md().render('---\ntitle: x\n\nstill writing\n');
    expect(html).not.toContain('data-frontmatter');
    expect(html).toContain('<hr>');
  });

  it('still renders thematic breaks below the front matter', () => {
    const html = md().render('---\ntitle: x\n---\n\nabove\n\n---\n\nbelow\n');
    expect(html).toContain('data-frontmatter');
    expect(html).toContain('<hr>');
  });

  it('escapes HTML in the YAML body', () => {
    const html = md().render('---\nname: <script>\n---\n\nbody\n');
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>');
  });
});

describe('frontmatterToMarkdown', () => {
  it('wraps the body in fences', () => {
    expect(frontmatterToMarkdown('title: x')).toBe('---\ntitle: x\n---');
  });

  it('does not leave a blank line before the closing fence', () => {
    expect(frontmatterToMarkdown('title: x\n\n')).toBe('---\ntitle: x\n---');
  });

  it('round-trips the parsed body back to the original source', () => {
    const source = TRACKER_FILE.slice(0, TRACKER_FILE.indexOf('\n\n# '));
    const tokens = md().parse(TRACKER_FILE, {});
    const token = tokens.find((t) => t.type === 'frontmatter');

    expect(token).toBeDefined();
    expect(frontmatterToMarkdown(token!.content)).toBe(source);
  });
});
