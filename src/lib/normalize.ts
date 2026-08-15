/** Corner-bracket quotes → curly double quotes before any generation. */
export function normalizeQuotes(text: string): string {
  return text
    .replace(/\u300C/g, "\u201C") // 「 → “
    .replace(/\u300D/g, "\u201D") // 」 → ”
    .replace(/\u300E/g, "\u201C") // 『 → “
    .replace(/\u300F/g, "\u201D"); // 』 → ”
}

export function normalizeInputBrief(brief: string): string {
  return normalizeQuotes(brief.trim());
}
