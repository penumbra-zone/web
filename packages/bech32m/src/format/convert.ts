import { bech32m } from 'bech32';
import { StringLength } from './strings';
import { ByteLength } from './bytes';
import { Prefix } from './prefix';

/**
 * Internal use. Converts a valid bech32m string of spec format to a byte array,
 * throwing on invalid input.
 *
 * @param b32mStr input string
 * @param prefix verified or detected input prefix
 * @returns byte array of spec length
 */
export const fromBech32m = <P extends Prefix>(
  b32mStr: `${P}1${string}`,
  prefix: Prefix = b32mStr.slice(0, b32mStr.lastIndexOf('1')) as P,
): Uint8Array => {
  const p = b32mStr.slice(0, b32mStr.lastIndexOf('1'));
  if (p !== prefix) throw new TypeError('Unexpected prefix');
  return from(b32mStr, p, StringLength[p], ByteLength[p]);
};

/**
 * Internal use. Converts a byte array to a valid bech32m string of spec format,
 * throwing on invalid input.
 *
 * @param data input bytes
 * @param prefix known prefix in spec
 * @returns bech32m string of spec format
 */
export const toBech32m = <P extends Prefix>(data: Uint8Array, prefix: P): `${P}1${string}` =>
  to(data, prefix, StringLength[prefix], ByteLength[prefix]);

/**
 * Internal use. Converts a bech32m string to a byte array. Verifies the prefix,
 * input string length, and output byte length.
 *
 * @param bStr input string
 * @param expectPrefix verify input prefix
 * @param expectLength verify input length
 * @param expectBytes expected output length
 * @returns byte array of length `expectBytes`
 */
const from = (
  bStr: string,
  expectPrefix: string,
  expectLength: number,
  expectBytes: number,
): Uint8Array => {
  if (bStr.length !== expectLength) throw new TypeError('Invalid string length');
  const { prefix, words } = bech32m.decode(bStr, expectLength);
  if (prefix !== expectPrefix) throw new TypeError('Wrong prefix');
  const bytes = new Uint8Array(bech32m.fromWords(words));
  if (bytes.length !== expectBytes) throw new TypeError('Unexpected data length');
  return bytes;
};

/**
 * Internal use. Converts a byte array to a bech32m string with specified
 * prefix. Verifies input byte length and output string length.
 *
 * @param bData input bytes
 * @param prefix string to use as prefix
 * @param expectLength expected output length, including prefix
 * @param expectBytes verify input byte length
 * @returns bech32m with prefix and length `expectLength`
 */
const to = <P extends string>(
  bData: Uint8Array,
  prefix: P,
  expectLength: number,
  expectBytes: number,
): `${P}1${string}` => {
  if (bData.length !== expectBytes) throw new TypeError('Invalid data length');
  const bStr = bech32m.encode(prefix, bech32m.toWords(bData), expectLength);
  if (bStr.length !== expectLength) throw new TypeError('Unexpected string length');
  return bStr as `${P}1${string}`;
};
