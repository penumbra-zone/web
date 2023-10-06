import { Buffer } from 'buffer';
import { validateSchema } from './validation';
import { Base64StringSchema } from './base64';

export const base64ToHex = (base64: string): string => {
  const validated = validateSchema(Base64StringSchema, base64);
  const buffer = Buffer.from(validated, 'base64');
  return buffer.toString('hex');
};

export const uint8ArrayToHex = (uint8Array: Uint8Array): string => {
  return Buffer.from(uint8Array).toString('hex');
};

export const hexToBase64 = (hex: string): string => {
  const buffer = Buffer.from(hex, 'hex');
  return buffer.toString('base64');
};
