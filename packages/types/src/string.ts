const encoder = new TextEncoder();
export const stringToUint8Array = (str: string): Uint8Array => {
  return encoder.encode(str);
};

const decoder = new TextDecoder();
export const uint8ArrayToString = (array: Uint8Array): string => {
  return decoder.decode(array);
};

export const shorten = (str: string, endsLength = 4) => {
  if (str.length <= endsLength + 4) {
    return str;
  } else {
    return str.slice(0, endsLength) + '…' + str.slice(endsLength * -1);
  }
};
