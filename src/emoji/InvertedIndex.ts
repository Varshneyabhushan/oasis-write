import type { EmojiItem } from './loader';

/**
 * Inverted index mapping every query prefix to a pre-ranked list of emoji indices.
 *
 * Ranking (baked in at build time, O(1) lookup):
 *   1. Full name starts with query       — white_check_mark for "white"
 *   2. Name segment starts with query    — white_check_mark for "check"
 *   3. Keyword starts with query         — white_check_mark for "tick"
 *
 * Within each rank group the order follows the EMOJIS array (Unicode/emojilib order).
 */
export class InvertedIndex {
  private index = new Map<string, number[]>();

  build(emojis: EmojiItem[]): this {
    const nameMap    = new Map<string, Set<number>>();
    const segmentMap = new Map<string, Set<number>>();
    const kwMap      = new Map<string, Set<number>>();

    const addPrefixes = (map: Map<string, Set<number>>, word: string, idx: number) => {
      for (let len = 1; len <= word.length; len++) {
        const prefix = word.slice(0, len);
        let set = map.get(prefix);
        if (!set) { set = new Set(); map.set(prefix, set); }
        set.add(idx);
      }
    };

    for (let i = 0; i < emojis.length; i++) {
      const { name, keywords } = emojis[i];

      addPrefixes(nameMap, name, i);

      for (const part of name.split('_')) {
        if (part.length > 1) addPrefixes(segmentMap, part, i);
      }

      for (const kw of keywords) {
        const clean = kw.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (clean.length > 1) addPrefixes(kwMap, clean, i);
      }
    }

    // Merge the three maps into one ranked list per prefix
    const allPrefixes = new Set([...nameMap.keys(), ...segmentMap.keys(), ...kwMap.keys()]);

    for (const prefix of allPrefixes) {
      const seen = new Set<number>();
      const ranked: number[] = [];

      for (const idx of (nameMap.get(prefix) ?? [])) {
        seen.add(idx); ranked.push(idx);
      }
      for (const idx of (segmentMap.get(prefix) ?? [])) {
        if (!seen.has(idx)) { seen.add(idx); ranked.push(idx); }
      }
      for (const idx of (kwMap.get(prefix) ?? [])) {
        if (!seen.has(idx)) { seen.add(idx); ranked.push(idx); }
      }

      this.index.set(prefix, ranked);
    }

    return this;
  }

  lookup(query: string, limit: number): number[] {
    const q = query.toLowerCase().replace(/[^a-z0-9_]/g, '');
    const results = this.index.get(q);
    return results ? results.slice(0, limit) : [];
  }
}
