import { describe, it, expect } from 'vitest';
import { searchEmojis } from '../search';

describe('searchEmojis (full emojilib dataset)', () => {

  // ✅ is named "check_mark_button" in CLDR (not the old Slack "white_check_mark")
  it('finds ✅ by name prefix "check"', () => {
    const names = searchEmojis('check', 20).map(e => e.name);
    expect(names).toContain('check_mark_button');
  });

  it('finds ✅ by keyword "tick"', () => {
    // "tick" is a keyword on check_mark_button; many emojis share this keyword
    // so use a generous limit
    const names = searchEmojis('tick', 30).map(e => e.name);
    expect(names).toContain('check_mark_button');
  });

  it('returns check_mark_button first for ":check_mark"', () => {
    const results = searchEmojis('check_mark');
    expect(results[0].name).toBe('check_mark_button');
  });

  it('ranks full-name prefix matches before segment matches', () => {
    // "check" is the start of check_mark_button (full name), but only a segment
    // of hypothetical names like "white_check" — check_mark_* emojis must come first
    const names = searchEmojis('check', 10).map(e => e.name);
    expect(names[0]).toMatch(/^check/);
  });

  it('firefighter comes before fire emoji for "fire" (array order)', () => {
    // firefighter (🧑‍🚒) appears before fire (🔥) in emojilib's Unicode order
    const names = searchEmojis('fire', 10).map(e => e.name);
    expect(names.indexOf('firefighter')).toBeLessThan(names.indexOf('fire'));
  });

  it('finds 🔥 fire emoji within top results', () => {
    const names = searchEmojis('fire', 10).map(e => e.name);
    expect(names).toContain('fire');
  });

  it('finds thumbs_up by name prefix', () => {
    const emojis = searchEmojis('thumbs', 5).map(e => e.emoji);
    expect(emojis).toContain('👍');
  });

  it('finds smile emojis', () => {
    const results = searchEmojis('smile', 8);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toMatch(/smile/);
  });

  it('respects the limit parameter', () => {
    expect(searchEmojis('a', 5).length).toBeLessThanOrEqual(5);
    expect(searchEmojis('a', 1).length).toBe(1);
  });

  it('returns empty array for gibberish', () => {
    expect(searchEmojis('zzznomatchxyz')).toEqual([]);
  });

  it('all results have non-empty emoji and name', () => {
    for (const item of searchEmojis('smile')) {
      expect(item.emoji.length).toBeGreaterThan(0);
      expect(item.name.length).toBeGreaterThan(0);
    }
  });
});
