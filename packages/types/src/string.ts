import { Buffer } from 'buffer/';
import { BECH32_PREFIX } from './address';

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
    return str.slice(0, endsLength) + '…' + str.slice(endsLength * -1);
  }
};

export const shortenAddress = (str: string) => {
  const charsToDisplay = 24;
  return str.slice(0, BECH32_PREFIX.length + 1 + charsToDisplay) + '…';
};
