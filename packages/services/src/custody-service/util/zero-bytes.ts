export const isZeroBytes = (i: Uint8Array): boolean => !i.length || i.every(v => !v);
