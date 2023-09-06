import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { validateSchema } from './utils';
import { z } from 'zod';

describe('utils', () => {
  let mockLogger: Mock;

  beforeEach(() => {
    mockLogger = vi.fn();
    vi.stubGlobal('console', {
      error: mockLogger,
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  describe('validateSchema()', () => {
    it('Throws in test environment', () => {
      expect(() => {
        validateSchema(z.string(), 123);
      }).toThrow();
    });

    it('Throws in chrome dev environment', () => {
      vi.stubGlobal('process', {
        ...process,
        versions: { node: null },
      });
      vi.stubGlobal('window', {
        chrome: {
          runtime: {
            id: 'xyz',
            getManifest: () => ({}),
          },
        },
      });

      expect(() => {
        validateSchema(z.string(), 123);
      }).toThrow();
    });

    it('Does not throw in node prod', () => {
      vi.stubEnv('NODE_ENV', 'production');

      expect(() => {
        validateSchema(z.string(), 123);
      }).not.toThrow();
      expect(mockLogger).toHaveBeenCalledOnce();
    });

    it('Does not throw in chrome ext prod', () => {
      vi.stubGlobal('process', {
        ...process,
        versions: { node: null },
      });
      vi.stubGlobal('window', {
        chrome: {
          runtime: {
            id: 'xyz',
            getManifest: () => ({ update_url: 'http://test.xyz' }),
          },
        },
      });

      expect(() => {
        validateSchema(z.string(), 123);
      }).not.toThrow();
      expect(mockLogger).toHaveBeenCalledOnce();
    });

    it('Does not throw in browser env', () => {
      vi.stubGlobal('process', {
        ...process,
        versions: { node: null },
      });
      vi.stubGlobal('window', {});

      expect(() => {
        validateSchema(z.string(), 123);
      }).not.toThrow();
      expect(mockLogger).toHaveBeenCalledOnce();
    });

    it('Does not throw in unknown env', () => {
      vi.stubGlobal('process', {
        ...process,
        versions: { node: null },
      });
      vi.stubGlobal('window', undefined);

      expect(() => {
        validateSchema(z.string(), 123);
      }).not.toThrow();
      expect(mockLogger).toHaveBeenCalledOnce();
    });
  });
});
