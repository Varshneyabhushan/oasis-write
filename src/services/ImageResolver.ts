import { convertFileSrc } from '@tauri-apps/api/core';

export type ResolvedImageSrc = { primary: string; fallback?: string };

const toFileUrl = (absolutePath: string): string => {
  const normalized = absolutePath.replace(/\\/g, '/');
  if (normalized.startsWith('file://')) return normalized;
  const needsLeadingSlash = !normalized.startsWith('/');
  return `file://${needsLeadingSlash ? '/' : ''}${normalized}`;
};

export const resolveImageSrc = (src: string | null | undefined, filePath?: string): ResolvedImageSrc => {
  if (!src) return { primary: '' };
  const normalized = src.trim();

  if (/^(https?:)?\/\//i.test(normalized) || normalized.startsWith('data:') || normalized.startsWith('asset:') || normalized.startsWith('tauri:')) {
    return { primary: normalized };
  }

  let absolutePath = normalized;

  if (!normalized.startsWith('/') && !/^[a-zA-Z]:[\\/]/.test(normalized)) {
    if (filePath) {
      const normalizedFilePath = filePath.replace(/\\/g, '/');
      const baseDir = normalizedFilePath.substring(0, normalizedFilePath.lastIndexOf('/') + 1);
      try {
        const url = new URL(normalized, `file://${baseDir}`);
        absolutePath = decodeURIComponent(url.pathname).replace(/^\/([a-zA-Z]:)/, '$1');
      } catch (error) {
        console.warn('Failed to resolve image path:', error);
        return { primary: normalized };
      }
    } else {
      return { primary: normalized };
    }
  }

  return {
    primary: convertFileSrc(absolutePath),
    fallback: toFileUrl(absolutePath),
  };
};
