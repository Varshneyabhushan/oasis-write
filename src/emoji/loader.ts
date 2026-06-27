import emojilib from 'emojilib';

export interface EmojiItem {
  name: string;
  emoji: string;
  keywords: string[];
}

export const EMOJIS: EmojiItem[] = Object.entries(emojilib).map(([emoji, keywords]) => ({
  name: keywords[0],
  emoji,
  keywords: keywords.slice(1),
}));
