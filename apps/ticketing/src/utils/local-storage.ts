export function localStorageGet<T = string>(key: string) {
  const value = localStorage.getItem(key);
  if (value !== null) {
    if (!/\{|\[/.test(value?.charAt(0))) {
      return value as T;
    }
    try {
      return JSON.parse(value) as T;
    } catch (e) {
      console.error(e);
    }
  }
}
