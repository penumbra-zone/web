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

const getFirstName = createGetter<Employee, string>(employee => employee?.firstName);
const getLastName = createGetter<Employee, string>(employee => employee?.lastName);
const getAddress = createGetter<Employee, Address>(employee => employee?.address);
const getCity = createGetter<Address, string>(address => address?.city);
const getCountry = createGetter<Address, string>(address => address?.country);
const getFirstLetter = createGetter<string, string>(value => value?.[0]);

describe('createGetter()', () => {
  describe('getter()', () => {
    it('gets the value via the function passed into `createGetter()`', () => {
      expect(getFirstName(employee)).toBe('Alice');
    });

    it('returns `undefined` when the whole value is undefined', () => {
      expect(getLastName(undefined)).toBeUndefined();
    });

    it('returns `undefined` for an undefined property', () => {
      expect(getLastName(employee)).toBeUndefined();
    });
  });

  describe('getter.orThrow()', () => {
    it('throws when the whole value is undefined', () => {
      expect(() => getFirstName.orThrow(undefined)).toThrow();
    });

    it('throws for an undefined property', () => {
      expect(() => getLastName.orThrow(employee)).toThrow();
    });

    it('throws the passed-in error message, if provided', () => {
      expect(() => getFirstName.orThrow(undefined, 'oops!')).toThrow('oops!');
    });

    it('does not throw if a value is falsey but not undefined', () => {
      const employee: Employee = { firstName: 'Alice', lastName: '' };
      expect(() => getLastName.orThrow(employee)).not.toThrow();
    });
  });

  describe('getter.pipe()', () => {
    it('pipes the getters together and returns the final result', () => {
      expect(getAddress.pipe(getCity)(employee)).toBe('San Francisco');
    });

    describe('getter.pipe().orThrow()', () => {
      it('throws when any value in the property chain is undefined', () => {
        expect(() => getAddress.pipe(getCity).orThrow({ firstName: 'Alice' })).toThrow();
        expect(() => getAddress.pipe(getCity).orThrow(undefined)).toThrow();
        expect(() => getAddress.pipe(getCountry).orThrow(employee)).toThrow();
      });
    });

    describe('getter.pipe(anotherGetter.orThrow)', () => {
      it('throws when the return value of the getter used with `.orThrow` is undefined', () => {
        expect(() => getAddress.pipe(getCity.orThrow)({ firstName: 'Alice' })).toThrow();
      });

      it('does not throws when the return value of the getter _not_ used with `.orThrow` is undefined', () => {
        const employee: Employee = {
          firstName: 'Alice',
          address: {
            city: '', // `getFirstLetter` will return undefined
            state: 'California',
          },
        };

        expect(() =>
          getAddress
            .pipe(getCity.orThrow)
            // getFirstLetter returns `undefined` due to the empty string. But we're
            // not using `getFirstLetter.orThrow`, nor are we calling `.orThrow` on
            // the whole getter chain, so it won't throw.
            .pipe(getFirstLetter)(employee),
        ).not.toThrow();
      });
    });
  });
});
