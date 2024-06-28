export function pluralize(count: number | null | undefined, wordSingle: string, wordPlural?: string) {
  if (count === 1) return wordSingle;
  return wordPlural || wordSingle + 's';
}
