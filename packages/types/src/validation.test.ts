import { afterEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { isType, validateSchema } from './validation';

describe('validation', () => {
  describe('validateSchema()', () => {
    afterEach(() => {
      vi.unstubAllEnvs();
      vi.unstubAllGlobals();
    });

    it('Throws in test environment', () => {
      expect(() => {
        validateSchema(z.string(), 123);
      }).toThrow();
    });

    it('Throws in dev environment', () => {
      vi.stubEnv('NODE_ENV', 'development');

      expect(() => {
        validateSchema(z.string(), 123);
      }).toThrow();
    });

    it('Does not throw in prod', () => {
      vi.stubEnv('NODE_ENV', 'production');

      expect(() => {
        validateSchema(z.string(), 123);
      }).not.toThrow();
    });

    it('Does not throw in unknown env', () => {
      vi.stubGlobal('process', undefined);

      expect(() => {
        validateSchema(z.string(), 123);
      }).not.toThrow();
    });
  });

  describe("isType()'s returned type predicate function", () => {
    interface Person {
      name: string;
      age?: number;
    }

    const personWithAgeSchema = z.object({
      name: z.string(),
      age: z.number(),
    });

    it('returns `true` if the passed-in value matches the schema', () => {
      const matchingPerson: Person = {
        name: 'Ada Lovelace',
        age: 30,
      };

      expect(isType(personWithAgeSchema)(matchingPerson)).toBe(true);
    });

    it('returns `false` if the passed-in value does not match the schema', () => {
      const nonMatchingPerson: Person = {
        name: 'Ada Lovelace',
      };

      expect(isType(personWithAgeSchema)(nonMatchingPerson)).toBe(false);
    });
  });
});
