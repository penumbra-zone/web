import { webcrypto } from 'node:crypto';
import { vi } from 'vitest';

/**
 * JSDom (which the browser tests run in) doesn't natively support
 * `window.crypto`, so we need to polyfill it.
 */
vi.stubGlobal('crypto', webcrypto);
