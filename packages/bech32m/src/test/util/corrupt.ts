import { bech32m } from 'bech32';

/**
 * @param goodBech32 a valid bech32/bech32m string
 * @param change an optional object with a string index *i* and a character *c* to replace
 * @returns the same string, with one character changed
 */
export const corruptBech32 = (goodBech32: string, change?: { i: number; c: string }) => {
  const separator = goodBech32.lastIndexOf('1');
  const [hrp, data] = [goodBech32.slice(0, separator), goodBech32.slice(separator + 1)];

  const alphabet = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

  const index = change?.i ?? Math.floor(Math.random() * data.length);
  const dontUse = data[index];
  const wrongChar = (change ? [change.c] : Array.from(alphabet))
    .filter(c => c !== dontUse)
    .sort(Math.random)
    .pop();
  const bad = `${data.slice(0, index)}${wrongChar}${data.slice(index + 1)}`;

  return `${hrp}1${bad}`;
};

export const generateInvalid = (okBytes: Uint8Array, okString: string, innerName = 'inner') => {
  const prefix = okString.slice(0, okString.lastIndexOf('1'));
  return {
    longBytes: { [innerName]: new Uint8Array([...okBytes, okBytes[0]!]) },
    shortBytes: { [innerName]: okBytes.slice(1) },
    longString: bech32m.encode(prefix, bech32m.toWords([...okBytes, okBytes[0]!]), Infinity),
    shortString: bech32m.encode(prefix, bech32m.toWords(okBytes.slice(1)), Infinity),
    corruptString: corruptBech32(okString),
    wrongPrefix: Array.from(prefix).reverse().join('') + okString.slice(okString.lastIndexOf('1')),
    truncatedString: okString.slice(0, -1),
  };
};
