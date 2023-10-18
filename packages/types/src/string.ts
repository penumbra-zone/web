import { Buffer } from 'buffer';

export const stringToUint8Array = (str: string): Uint8Array => {
  const buffer = Buffer.from(str, 'utf8');
  return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
};

export const uint8ArrayToString = (array: Uint8Array): string => {
  const buffer = Buffer.from(array.buffer, array.byteOffset, array.byteLength);
  return buffer.toString('utf8');
};

export const shorten = (str: string, endsLength = 4) => {
  if (str.length <= endsLength + 4) {
    return str;
  } else {
    return str.slice(0, endsLength) + '...' + str.slice(endsLength * -1);
  }
};

// Starts with: penumbrawalletid...
export const shortenWalletId = (str: string, endsLength = 4) => {
  return shorten(str.slice(16), endsLength);
};
