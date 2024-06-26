export function stringToNumber(value: string | number | null | undefined) {
  const number = (value ?? '').toString().replace(/[^\d-.]/g, '');
  const defaultValue = null;

  if (!number) return defaultValue;

  const result = Number(number);

  if (isNaN(result)) return defaultValue;

  return result;
}
