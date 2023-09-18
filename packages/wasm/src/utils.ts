export const uint8ArrayToHex = (uint8Array: Uint8Array): string =>
  Array.from(uint8Array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
