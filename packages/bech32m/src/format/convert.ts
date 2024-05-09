import { bech32, bech32m, BechLib } from 'bech32';
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
  return fromBechWithLib(b32mStr, prefix, bech32m);
};

/**
 * Similar to above, but used to convert from Bech32 for compatibility reasons.
 *
 * @param b32mStr input string
 * @param prefix verified or detected input prefix
 * @returns byte array of spec length
 */
export const fromBech32 = <P extends Prefix>(
  b32mStr: `${P}1${string}`,
  prefix: Prefix = b32mStr.slice(0, b32mStr.lastIndexOf('1')) as P,
): Uint8Array => {
  return fromBechWithLib(b32mStr, prefix, bech32);
};

const fromBechWithLib = <P extends Prefix>(
  b32mStr: `${P}1${string}`,
  prefix: Prefix,
  bechLib: BechLib,
): Uint8Array => {
  const p = b32mStr.slice(0, b32mStr.lastIndexOf('1'));
  if (p !== prefix) throw new TypeError(`Unexpected prefix: expected ${prefix}, got ${p}`);
  return from({
    bechLib: bechLib,
    b32mStr,
    expectPrefix: p,
    expectLength: StringLength[p],
    expectBytes: ByteLength[p],
  });
};

/**
 * Internal use. Converts a byte array to a valid bech32m string of spec format,
 * throwing on invalid input.
 *
 * @param bData input bytes
 * @param prefix known prefix in spec
 * @returns bech32m string of spec format
 */
export const toBech32m = <P extends Prefix>(bData: Uint8Array, prefix: P): `${P}1${string}` =>
  to({
    bechLib: bech32m,
    bData,
    prefix,
    expectLength: StringLength[prefix],
    expectBytes: ByteLength[prefix],
  });

/**
 * Similar to above, but used to convert to Bech32 for compatibility reasons.
 *
 * @param bData input bytes
 * @param prefix known prefix in spec
 * @returns bech32 string of spec format
 */
export const toBech32 = <P extends Prefix>(bData: Uint8Array, prefix: P): `${P}1${string}` =>
  to({
    bechLib: bech32,
    bData,
    prefix,
    expectLength: StringLength[prefix],
    expectBytes: ByteLength[prefix],
  });

interface FromParams {
  bechLib: BechLib; // Lib doing decoding
  b32mStr: string; // input string
  expectPrefix: string; // verify input prefix
  expectLength: number; // verify input length
  expectBytes: number; // expected output length
}

/**
 * Internal use. Converts a bech32m string to a byte array. Verifies the prefix,
 * input string length, and output byte length.
 *
 * @returns byte array of length `expectBytes`
 */
const from = ({
  bechLib,
  b32mStr,
  expectPrefix,
  expectLength,
  expectBytes,
}: FromParams): Uint8Array => {
  if (b32mStr.length !== expectLength) {
    throw new TypeError(`Invalid string length: expected ${expectLength}, got ${b32mStr.length}`);
  }

  const { prefix, words } = bechLib.decode(b32mStr, expectLength);
  if (prefix !== expectPrefix) throw new TypeError('Wrong prefix');
  const bytes = new Uint8Array(bechLib.fromWords(words));
  if (bytes.length !== expectBytes) throw new TypeError('Unexpected data length');
  return bytes;
};

interface ToParams<P extends string> {
  bechLib: BechLib; // Lib doing encoding
  bData: Uint8Array; // input bytes
  prefix: P; // string to use as prefix
  expectLength: number; // expected output length, including prefix
  expectBytes: number; // verify input byte length
}

/**
 * Internal use. Converts a byte array to a bech32m string with specified
 * prefix. Verifies input byte length and output string length.
 *
 * @returns bech32m with prefix and length `expectLength`
 */
const to = <P extends string>({
  bechLib,
  bData,
  prefix,
  expectLength,
  expectBytes,
}: ToParams<P>): `${P}1${string}` => {
  if (bData.length !== expectBytes) {
    throw new TypeError(`Invalid data length: expected ${expectBytes}, got ${bData.length}`);
  }
  const bStr = bechLib.encode(prefix, bechLib.toWords(bData), expectLength);
  if (bStr.length !== expectLength) throw new TypeError('Unexpected string length');
  return bStr as `${P}1${string}`;
};
