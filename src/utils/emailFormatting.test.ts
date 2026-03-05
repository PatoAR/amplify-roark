import { describe, it, expect } from 'vitest';
import { toBoldUnicode, collapseNewlinesForEmail } from './emailFormatting';

describe('toBoldUnicode', () => {
  it('converts uppercase letters to bold Unicode', () => {
    const result = toBoldUnicode('ABC');
    expect(result).toBe('\u{1D400}\u{1D401}\u{1D402}');
  });

  it('converts lowercase letters to bold Unicode', () => {
    const result = toBoldUnicode('abc');
    expect(result).toBe('\u{1D41A}\u{1D41B}\u{1D41C}');
  });

  it('converts digits to bold Unicode', () => {
    const result = toBoldUnicode('123');
    expect(result).toBe('\u{1D7CF}\u{1D7D0}\u{1D7D1}');
  });

  it('preserves non-alphanumeric characters', () => {
    const result = toBoldUnicode('Hi! #1');
    expect(result).toContain('!');
    expect(result).toContain('#');
    expect(result).toContain(' ');
  });

  it('returns empty/falsy input unchanged', () => {
    expect(toBoldUnicode('')).toBe('');
    expect(toBoldUnicode(null as unknown as string)).toBe(null);
    expect(toBoldUnicode(undefined as unknown as string)).toBe(undefined);
  });

  it('handles accented characters by keeping combining marks', () => {
    const result = toBoldUnicode('é');
    expect(result.length).toBeGreaterThanOrEqual(2);
  });
});

describe('collapseNewlinesForEmail', () => {
  it('collapses \\n to a single space', () => {
    expect(collapseNewlinesForEmail('hello\nworld')).toBe('hello world');
  });

  it('collapses \\r\\n to a single space', () => {
    expect(collapseNewlinesForEmail('hello\r\nworld')).toBe('hello world');
  });

  it('collapses multiple newlines to a single space', () => {
    expect(collapseNewlinesForEmail('hello\n\n\nworld')).toBe('hello world');
  });

  it('collapses Unicode line/paragraph separators', () => {
    expect(collapseNewlinesForEmail('hello\u2028world')).toBe('hello world');
    expect(collapseNewlinesForEmail('hello\u2029world')).toBe('hello world');
  });

  it('collapses vertical tab and form feed', () => {
    expect(collapseNewlinesForEmail('hello\vworld')).toBe('hello world');
    expect(collapseNewlinesForEmail('hello\fworld')).toBe('hello world');
  });

  it('trims leading and trailing whitespace', () => {
    expect(collapseNewlinesForEmail('\nhello world\n')).toBe('hello world');
  });

  it('returns empty/falsy input unchanged', () => {
    expect(collapseNewlinesForEmail('')).toBe('');
    expect(collapseNewlinesForEmail(null as unknown as string)).toBe(null);
  });
});
