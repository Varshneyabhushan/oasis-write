// Lightweight, fast hash for content identity checks (FNV-1a 32-bit).
export const hashContent = (content: string): string => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < content.length; i++) {
    hash ^= content.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16);
};

