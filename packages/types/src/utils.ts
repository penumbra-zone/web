import { Buffer } from 'buffer';
import { validateSchema } from './validation';
import { Base64StringSchema } from './base64';

export const base64ToUint8Array = (base64: string): Uint8Array => {
  const validated = validateSchema(Base64StringSchema, base64);
  const buffer = Buffer.from(validated, 'base64');
  return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
};

export const uint8ArrayToBase64 = (byteArray: Uint8Array): string => {
  return Buffer.from(byteArray).toString('base64');
};
