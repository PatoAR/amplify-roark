/**
 * Converts letters and digits to Unicode Mathematical Bold equivalents, including
 * accented letters (via NFD: base letter → bold, combining marks kept so they attach).
 * Renders as bold in Outlook, Gmail, and most email clients that support Unicode.
 * Used in mailto: bodies where HTML is not supported.
 */
export function toBoldUnicode(text: string): string {
  if (!text) return text;
  const BOLD_A_OFFSET = 0x1d400 - 0x41; // Bold capitals A-Z
  const BOLD_A_LOWER_OFFSET = 0x1d41a - 0x61; // Bold small a-z
  const BOLD_ZERO_OFFSET = 0x1d7ce - 0x30;   // Bold digits 0-9

  const normalized = text.normalize('NFD');
  return Array.from(normalized, (char) => {
    if (/\p{M}/u.test(char)) return char; // combining mark: keep so it attaches to previous (bold) base
    const code = char.codePointAt(0)!;
    if (code >= 0x41 && code <= 0x5a) return String.fromCodePoint(code + BOLD_A_OFFSET);
    if (code >= 0x61 && code <= 0x7a) return String.fromCodePoint(code + BOLD_A_LOWER_OFFSET);
    if (code >= 0x30 && code <= 0x39) return String.fromCodePoint(code + BOLD_ZERO_OFFSET);
    return char;
  }).join('');
}

/** Collapses all line-break variants to a single space so mailto body lines don't get extra blank lines. */
export function collapseNewlinesForEmail(text: string): string {
  if (!text) return text;
  return text.replace(/[\r\n\u2028\u2029\v\f]+/g, ' ').trim();
}
