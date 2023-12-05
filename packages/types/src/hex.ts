import { validateSchema } from './validation';
import { Base64StringSchema } from './base64';

export const base64ToHex = (base64: string): string => {
  const validated = validateSchema(Base64StringSchema, base64);
  const buffer = Buffer.from(validated, 'base64');
  return buffer.toString('hex');
};

export const hexToBase64 = (hex: string): string => {
  const buffer = Buffer.from(hex, 'hex');
  return buffer.toString('base64');
};

export const uint8ArrayToHex = (uint8Array: Uint8Array): string => {
  return Buffer.from(uint8Array).toString('hex');
};

export const hexToUint8Array = (hexString: string): Uint8Array => {
  // Check if the input string is a valid hexadecimal string
  if (!/^([0-9A-Fa-f]{2})*$/.test(hexString)) {
    throw new Error(`Invalid hexadecimal string: ${hexString}`);
  }

  const buffer = Buffer.from(hexString, 'hex');
  return new Uint8Array(buffer);
};
