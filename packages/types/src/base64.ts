import { z } from 'zod';

export const Base64StringSchema = z.string().refine(
  str => {
    // Regular expression that matches base64 strings
    const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
    return base64Regex.test(str);
  },
  {
    message: 'Invalid base64 string',
  },
);

export type Base64Str = z.infer<typeof Base64StringSchema>;

export const InnerBase64Schema = z.object({ inner: Base64StringSchema });
