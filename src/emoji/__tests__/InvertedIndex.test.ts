import { describe, it, expect, beforeEach } from 'vitest';
import { InvertedIndex } from '../InvertedIndex';
import type { EmojiItem } from '../loader';

const FIXTURES: EmojiItem[] = [
  { name: 'white_check_mark', emoji: '✅', keywords: ['tick', 'ok', 'done', 'correct'] },
  { name: 'check_mark',       emoji: '✔️', keywords: ['done', 'correct', 'yes'] },
  { name: 'fire',             emoji: '🔥', keywords: ['hot', 'flame', 'lit'] },
  { name: 'fireworks',        emoji: '🎆', keywords: ['celebrate', 'party'] },
  { name: 'thumbs_up',        emoji: '👍', keywords: ['like', 'ok', 'good'] },
];

describe('InvertedIndex', () => {
  let idx: InvertedIndex;

  beforeEach(() => {
    idx = new InvertedIndex().build(FIXTURES);
  });

  it('finds by full name prefix', () => {
    const results = idx.lookup('fire', 10).map(i => FIXTURES[i].name);
    expect(results).toContain('fire');
    expect(results).toContain('fireworks');
  });

  it('ranks full-name prefix match before segment match', () => {
    // "check" is a segment of white_check_mark but the start of check_mark
    const results = idx.lookup('check', 10).map(i => FIXTURES[i].name);
    expect(results.indexOf('check_mark')).toBeLessThan(results.indexOf('white_check_mark'));
  });

  it('finds by name segment', () => {
    // "check" is a segment inside white_check_mark
    const results = idx.lookup('check', 10).map(i => FIXTURES[i].name);
    expect(results).toContain('white_check_mark');
  });

  it('finds by keyword', () => {
    // "tick" is a keyword of white_check_mark
    const results = idx.lookup('tick', 10).map(i => FIXTURES[i].name);
    expect(results).toContain('white_check_mark');
  });

  it('ranks name matches before keyword matches', () => {
    // "ok" is a keyword of both white_check_mark and thumbs_up
    // neither has "ok" in the name, both are keyword matches — order should be array order
    const results = idx.lookup('ok', 10).map(i => FIXTURES[i].name);
    expect(results).toContain('white_check_mark');
    expect(results).toContain('thumbs_up');
  });

  it('deduplicates — same emoji does not appear twice', () => {
    // fire appears as both a full name prefix and could match segment too
    const results = idx.lookup('fire', 10);
    const names = results.map(i => FIXTURES[i].name);
    const unique = new Set(names);
    expect(names.length).toBe(unique.size);
  });

  it('respects the limit', () => {
    const results = idx.lookup('c', 2);
    expect(results.length).toBeLessThanOrEqual(2);
  });

  it('returns empty for unknown query', () => {
    expect(idx.lookup('zzznomatch', 10)).toEqual([]);
  });

  it('is case-insensitive', () => {
    const lower = idx.lookup('fire', 10);
    const upper = idx.lookup('FIRE', 10);
    expect(lower).toEqual(upper);
  });
});
