import type { FileEntry } from '../components/FileTree';

export interface ResolvedMarkdownLink {
  type: 'external' | 'markdown' | 'anchor';
  targetPath?: string;    // Absolute path to .md file
  anchor?: string;         // Heading slug (e.g., "my-heading")
  exists?: boolean;        // File validation result
}

/**
 * Converts heading text to a slug format matching TipTapEditor's heading ID generation
 * Example: "My Heading!" -> "my-heading"
 */
export const headingToSlug = (headingText: string): string => {
  return headingText
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
};

/**
 * Recursively searches for a file in the file tree
 */
const findFileInTree = (files: FileEntry[], targetPath: string): boolean => {
  for (const file of files) {
    if (!file.is_directory && file.path === targetPath) {
      return true;
    }
    if (file.is_directory && file.children) {
      if (findFileInTree(file.children, targetPath)) {
        return true;
      }
    }
  }
  return false;
};

/**
 * Resolves a markdown link href to an absolute path and validates existence
 * Follows the same pattern as ImageResolver.ts
 */
export const resolveMarkdownLink = (
  href: string | null | undefined,
  currentFilePath?: string,
  files?: FileEntry[]
): ResolvedMarkdownLink => {
  if (!href) {
    return { type: 'external', exists: false };
  }

  const normalized = decodeURIComponent(href.trim());

  // Detect external URLs
  if (/^(https?:)?\/\//i.test(normalized)) {
    return { type: 'external', exists: true };
  }

  // Split href into path and anchor
  const [pathPart, anchorPart] = normalized.split('#');

  // Anchor-only link (same-file navigation)
  if (!pathPart && anchorPart) {
    return {
      type: 'anchor',
      anchor: headingToSlug(anchorPart),
      exists: true, // Validation happens separately
    };
  }

  // Check if it's a markdown file
  const isMarkdownFile = /\.(md|markdown)$/i.test(pathPart);
  if (!isMarkdownFile) {
    // Not a markdown file, treat as external
    return { type: 'external', exists: true };
  }

  // Resolve relative paths to absolute paths
  let absolutePath = pathPart;

  // Check if path is relative (not absolute or Windows drive path)
  if (!pathPart.startsWith('/') && !/^[a-zA-Z]:[\\/]/.test(pathPart)) {
    if (currentFilePath) {
      // Use URL API for relative path resolution (same as ImageResolver)
      const normalizedFilePath = currentFilePath.replace(/\\/g, '/');
      const baseDir = normalizedFilePath.substring(0, normalizedFilePath.lastIndexOf('/') + 1);
      try {
        const url = new URL(pathPart, `file://${baseDir}`);
        absolutePath = decodeURIComponent(url.pathname).replace(/^\/([a-zA-Z]:)/, '$1');
      } catch (error) {
        console.warn('Failed to resolve markdown link path:', error);
        return {
          type: 'markdown',
          targetPath: pathPart,
          anchor: anchorPart ? headingToSlug(anchorPart) : undefined,
          exists: false,
        };
      }
    } else {
      // No current file path to resolve against
      return {
        type: 'markdown',
        targetPath: pathPart,
        anchor: anchorPart ? headingToSlug(anchorPart) : undefined,
        exists: false,
      };
    }
  }

  // Validate file exists in the file tree
  const fileExists = files ? findFileInTree(files, absolutePath) : undefined;

  return {
    type: 'markdown',
    targetPath: absolutePath,
    anchor: anchorPart ? headingToSlug(anchorPart) : undefined,
    exists: fileExists,
  };
};
