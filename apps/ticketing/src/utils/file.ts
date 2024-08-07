export function convertToSafeFilename(string: string) {
  return string
    .replace(/[:]/g, '-')
    .replace(/(\d\d-\d\d-\d\d)\s((PM)|(AM))/g, '$1-$2')
    .replace(/[/.:]/g, '-')
    .replace(/[^a-zA-Z0-9\s_-]/g, '');
}
