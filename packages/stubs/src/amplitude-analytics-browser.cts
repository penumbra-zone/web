const stub = (name: string) =>
  globalThis.__DEV__ ? console.warn.bind(console, 'stub', name) : () => void null;

export const add = stub('add');
export const init = stub('init');
export const setUserId = stub('setUserId');
export const track = stub('track');
