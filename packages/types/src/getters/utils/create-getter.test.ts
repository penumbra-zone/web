import { describe, expect, it } from 'vitest';
import { createGetter } from './create-getter';

interface Address {
  city: string;
  state: string;
  country?: string;
}

interface Employee {
  firstName: string;
  lastName?: string;
  address?: Address;
}

const employee: Employee = {
  firstName: 'Alice',
  address: {
    city: 'San Francisco',
    state: 'California',
  },
};

const getFirstName = createGetter((employee?: Employee) => employee?.firstName);
const getLastName = createGetter((employee?: Employee) => employee?.lastName);
const getAddress = createGetter((employee?: Employee) => employee?.address);
const getCity = createGetter((address?: Address) => address?.city);
const getCountry = createGetter((address?: Address) => address?.country);
const getFirstLetter = createGetter((value?: string) => value?.[0]);

describe('createGetter()', () => {
  describe('getter()', () => {
    it('gets the value via the function passed into `createGetter()`', () => {
      expect(getFirstName(employee)).toBe('Alice');
    });

    it('throws when the whole value is undefined', () => {
      expect(() => getFirstName(undefined)).toThrow();
    });

    it('throws for an undefined property', () => {
      expect(() => getLastName(employee)).toThrow();
    });

    it('does not throw if a value is falsey but not undefined', () => {
      const employee: Employee = { firstName: 'Alice', lastName: '' };
      expect(() => getLastName(employee)).not.toThrow();
    });
  });

  describe('getter.optional()', () => {
    it('returns `undefined` when the whole value is undefined', () => {
      expect(getLastName.optional()(undefined)).toBeUndefined();
    });

    it('returns `undefined` for an undefined property', () => {
      expect(getLastName.optional()(employee)).toBeUndefined();
    });
  });

  describe('getter.pipe()', () => {
    it('pipes the getters together and returns the final result', () => {
      expect(getAddress.pipe(getCity)(employee)).toBe('San Francisco');
    });

    it('throws when any value in the property chain is undefined', () => {
      expect(() => getAddress.pipe(getCity)(undefined)).toThrow();
      expect(() => getAddress.pipe(getCity)({ firstName: 'Alice' })).toThrow();
      expect(() => getAddress.pipe(getCountry)(employee)).toThrow();
    });

    describe('getter.pipe() with .optional())', () => {
      const employee: Employee = {
        firstName: 'Alice',
        address: {
          city: '', // `getFirstLetter` will return undefined
          state: 'California',
        },
      };

      it('does not throw when the first getter is used with `.optional()` and some value in the chain is undefined', () => {
        expect(() =>
          getAddress.optional().pipe(getCity).pipe(getFirstLetter)(employee),
        ).not.toThrow();
      });
    });
  });
});
