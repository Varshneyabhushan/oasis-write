import type { Editor } from '@tiptap/react';
import { headingToSlug, type ResolvedMarkdownLink } from '../services/MarkdownLinkResolver';

/**
 * Scrolls to a heading in the editor by its slug
 */
export const scrollToHeadingBySlug = (editor: Editor, slug: string): void => {
  const { state, view } = editor;
  let targetPos: number | null = null;

  // Search for heading with matching slug
  state.doc.descendants((node, pos) => {
    if (node.type.name === 'heading') {
      const headingSlug = headingToSlug(node.textContent);
      if (headingSlug === slug) {
        targetPos = pos;
        return false; // Stop after first match
      }
    }
  });

  if (targetPos !== null) {
    // Get DOM node and scroll to it
    const dom = view.domAtPos(targetPos + 1);
    const element = dom.node.nodeType === 1
      ? (dom.node as Element)
      : (dom.node.parentElement as Element);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

/**
 * Extracts all heading slugs from the editor document
 */
export const extractHeadingSlugs = (editor: Editor): Set<string> => {
  const slugs = new Set<string>();
  editor.state.doc.descendants((node) => {
    if (node.type.name === 'heading') {
      slugs.add(headingToSlug(node.textContent));
    }
  });
  return slugs;
};

/**
 * Validates if a resolved markdown link is valid
 */
export const isLinkValid = (
  resolved: ResolvedMarkdownLink,
  headingSlugs: Set<string>
): boolean => {
  if (resolved.type === 'anchor') {
    return resolved.anchor ? headingSlugs.has(resolved.anchor) : false;
  } else if (resolved.type === 'markdown') {
    return resolved.exists !== false;
  }
  // External links are always valid
  return true;
};
