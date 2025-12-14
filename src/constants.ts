// Allowed file extensions for the file tree
export const ALLOWED_MARKDOWN_EXTENSIONS = ['md', 'markdown'] as const;
export const ALLOWED_IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'] as const;

// Helper function to check if a filename has an allowed extension
export function hasAllowedExtension(filename: string): boolean {
  const extension = filename.split('.').pop()?.toLowerCase();
  if (!extension) return false;

  return (
    ALLOWED_MARKDOWN_EXTENSIONS.includes(extension as any) ||
    ALLOWED_IMAGE_EXTENSIONS.includes(extension as any)
  );
}

// Helper function to check if a filename is an image
export function isImageFile(filename: string): boolean {
  const extension = filename.split('.').pop()?.toLowerCase();
  if (!extension) return false;

  return ALLOWED_IMAGE_EXTENSIONS.includes(extension as any);
}

// Helper function to get file extension validation error message
export function getFileExtensionErrorMessage(): string {
  const markdownExts = ALLOWED_MARKDOWN_EXTENSIONS.map(ext => `.${ext}`).join(', ');
  const imageExts = ALLOWED_IMAGE_EXTENSIONS.map(ext => `.${ext}`).join(', ');
  return `File must be a markdown (${markdownExts}) or image (${imageExts}) file`;
}
