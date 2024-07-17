export function convertToSafeFilename(string: string) {
  return string
    .replace(/[:]/g, '-')
    .replace(/(\d\d-\d\d-\d\d)\s((PM)|(AM))/g, '$1-$2')
    .replace(/[/.:]/g, '-')
    .replace(/[^a-zA-Z0-9\s_-]/g, '');
}

export function convertFileListToPreviewUrls(fileList?: FileList | File[]) {
  if (!fileList) return [];
  if (!(fileList instanceof FileList)) {
    new TypeError('The provided value is not a FileList.');
    return [];
  }

  const urls: string[] = [];

  for (const file of fileList) {
    urls.push(URL.createObjectURL(file));
  }

  return urls;
}
