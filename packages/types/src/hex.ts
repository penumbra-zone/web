import { Base64StringSchema } from './base64';
import { validateSchema } from './validation';

/**
 * @see https://stackoverflow.com/a/39460727/974981
 */
export const base64ToHex = (base64: string): string => {
  const validated = validateSchema(Base64StringSchema, base64);
  const bytes = atob(validated);

  let result = '';
  for (let i = 0; i < bytes.length; i++) {
    const hex = bytes.charCodeAt(i).toString(16);
    result += hex.length === 2 ? hex : '0' + hex;
  }

  return result;
};

/**
 * @see https://stackoverflow.com/a/41797377/974981
 */
export const hexToBase64 = (hex: string): string => {
  if (!hex) return '';

  return btoa(
    hex
      .match(/\w{2}/g)!
      .map(function (a) {
        return String.fromCharCode(parseInt(a, 16));
      })
      .join(''),
  );
};

/**
 * @see https://stackoverflow.com/a/65851423/974981
 */
export const uint8ArrayToHex = (uint8Array: Uint8Array): string => {
  return Array.from(uint8Array, i => i.toString(16).padStart(2, '0')).join('');
};

/**
 * @see https://stackoverflow.com/a/65851423/974981
 */
export const hexToUint8Array = (hexString: string): Uint8Array => {
  // Check if the input string is a valid hexadecimal string
  if (!/^([0-9A-Fa-f]{2})*$/.test(hexString)) {
    throw new Error(`Invalid hexadecimal string: ${hexString}`);
  }

  if (!hexString) return new Uint8Array();

  return new Uint8Array(hexString.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
};
