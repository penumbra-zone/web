/* eslint-disable @typescript-eslint/no-unnecessary-condition */
// Rule disabled so Typescript doesn't complain about unnecessary env checks
import { z } from 'zod';

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

export const uint8ArrayToHex = (uint8Array: Uint8Array): string =>
  Array.from(uint8Array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

enum Environment {
  NODE_DEV,
  NODE_PROD,
  CHROME_EXT_DEV,
  CHROME_EXT_PROD,
  BROWSER,
  UNKNOWN,
}

const isDevEnv = (): boolean => {
  const env = getEnv();
  return env === Environment.CHROME_EXT_DEV || env === Environment.NODE_DEV;
};

// Should consider moving this to a package if other consumers need this
const getEnv = (): Environment => {
  // Check for Node.js environment
  if (global.process?.versions?.node !== null) {
    return process.env['NODE_ENV'] === 'production' ? Environment.NODE_PROD : Environment.NODE_DEV;
  }

  // Check for Chrome extension environment
  else if (global.window && global.window?.chrome?.runtime?.id) {
    return !('update_url' in window.chrome.runtime.getManifest()) // Unpacked extensions do not have "update_url" field
      ? Environment.CHROME_EXT_DEV
      : Environment.CHROME_EXT_PROD;
  }

  // Check for browser environment
  else if (typeof window !== 'undefined') {
    return Environment.BROWSER;
  }

  // If neither node.js, chrome extension, nor browser
  else {
    return Environment.UNKNOWN;
  }
};
