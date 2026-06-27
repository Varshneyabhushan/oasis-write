import { EMOJIS } from './loader';
import { InvertedIndex } from './InvertedIndex';

const index = new InvertedIndex().build(EMOJIS);

export function searchEmojis(query: string, limit = 8) {
  return index.lookup(query, limit).map(i => EMOJIS[i]);
}
