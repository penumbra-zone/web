import { z } from 'zod';
import { isDevEnv } from './environment';

// In production, we do not want to throw validation errors, but log them.
// Given the extension update cycle, we want to opt for grace degradation.
// In our CI/CD, we'll throw validation errors so they can be fixed at build time.
export const validateSchema = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  const result = schema.safeParse(data);

  if (result.success) {
    return result.data;
  } else {
    if (isDevEnv()) {
      throw result.error;
    } else {
      console.error(result.error);
      return data as T;
    }
  }
};
