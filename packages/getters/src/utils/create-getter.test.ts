/* eslint-disable no-restricted-syntax */

import { describe, expect, expectTypeOf, it, test } from 'vitest';
import { createGetter } from './create-getter.js';
import { Getter } from './getter.js';

type City = 'Seattle' | 'San Francisco' | 'New York City';

interface Address {
  city: City;
  state?: string;
}

interface Person {
  firstName: string;
  lastName?: string;
  address?: Address;
}

// complete data
const alice: Person = {
  firstName: 'Alice',
  lastName: 'Liddell',
  address: {
    city: 'San Francisco',
    state: 'California',
  },
};

const bob: Person = {
  firstName: 'Bob',
  // missing lastName
  address: {
    city: 'Seattle',
    // missing state
  },
};

const charlie: Person = {
  firstName: 'Charlie',
  lastName: '', // falsy lastName
  // missing address
};

describe('createGetter()', () => {
  const selectFirstName = (p?: Person) => p?.firstName;
  const selectStringIndexOne = (a?: string) => a?.[1];

  it('creates a getter', () => {
    let getFirstNameFromPerson;
    expectTypeOf((getFirstNameFromPerson = createGetter(selectFirstName))).toEqualTypeOf<
      Getter<Person, string>
    >();
    expect(getFirstNameFromPerson).toBeInstanceOf(Function);
    expect(getFirstNameFromPerson).toHaveProperty(['optional', 'pipe']);
  });

  it('creates a getter with optional', () => {
    let getFirstNameFromPerson_optional;
    expectTypeOf(
      (getFirstNameFromPerson_optional = createGetter(selectFirstName).optional),
    ).toEqualTypeOf<Getter<Person, string | undefined>>();

    expect(getFirstNameFromPerson_optional).toBeInstanceOf(Function);
    expect(getFirstNameFromPerson_optional).toHaveProperty('optional');
    expect(getFirstNameFromPerson_optional).toHaveProperty('pipe');

    expect(getFirstNameFromPerson_optional.optional).toBe(getFirstNameFromPerson_optional);
  });

  it('creates a getter pipe', () => {
    const getFirstName = createGetter(selectFirstName);
    const getSecondLetter = createGetter(selectStringIndexOne);

    let getSecondLetterOfFirstNameFromPerson;
    expectTypeOf(
      (getSecondLetterOfFirstNameFromPerson = getFirstName.pipe(getSecondLetter)),
    ).toEqualTypeOf<Getter<Person, string>>();

    expect(getSecondLetterOfFirstNameFromPerson).toBeInstanceOf(Function);
    expect(getSecondLetterOfFirstNameFromPerson).toHaveProperty('optional');
    expect(getSecondLetterOfFirstNameFromPerson).toHaveProperty('pipe');
  });
});

describe('getting values and optional', () => {
  const getFirstName = createGetter((p?: Person) => p?.firstName);
  const getLastName = createGetter((p?: Person) => p?.lastName);

  it('gets the expected value', () => {
    expect(getFirstName(alice)).toBe('Alice');
    expect(getFirstName.optional(alice)).toBe('Alice');

    expect(getLastName(alice)).toBe('Liddell');
    expect(getLastName.optional(alice)).toBe('Liddell');
  });

  describe('undefined in the getter', () => {
    it('handles undefined input', () => {
      expect(() => getFirstName(undefined)).toThrow();
      expect(getFirstName.optional(undefined)).toBeUndefined();
    });

    it('handles undefined property', () => {
      expect(() => getLastName(bob)).toThrow();
      expect(getLastName.optional(bob)).toBeUndefined();
    });
  });

  test('successfully returns a falsy value', () => {
    expect(() => getLastName(charlie)).not.toThrow();
  });
});

describe('getter pipes', () => {
  const selectAddress = (p?: Person) => p?.address;
  const getAddressFromPerson = createGetter(selectAddress);
  const selectCity = (a?: Address) => a?.city;
  const getCityFromAddress = createGetter(selectCity);
  const getStateFromAddress = createGetter((a?: Address) => a?.state);

  it('pipes the getters together and returns the final result', () => {
    let getCityFromPerson;

    expectTypeOf((getCityFromPerson = getAddressFromPerson.pipe(getCityFromAddress))).toEqualTypeOf<
      Getter<Person, City>
    >();

    expect(getCityFromPerson(alice)).toBe('San Francisco');
    expect(getCityFromPerson(bob)).toBe('Seattle');
  });

  describe('undefined in the pipe', () => {
    let getStateFromPerson;

    expectTypeOf(
      (getStateFromPerson = getAddressFromPerson.pipe(getStateFromAddress)),
    ).toEqualTypeOf<Getter<Person, string>>();

    it('throws on undefined', () => {
      expect(() => getStateFromPerson(undefined)).toThrow();
      expect(getStateFromPerson(alice)).toBe('California');
      expect(() => getStateFromPerson(bob)).toThrow();
    });

    it("doesn't throw on undefined when optional", () => {
      expect(getStateFromPerson.optional(undefined)).toBeUndefined();
      expect(getStateFromPerson.optional(alice)).toBe('California');
      expect(getStateFromPerson.optional(bob)).toBeUndefined();
    });
  });

  describe('longer chains', () => {
    const getSecondLetter = createGetter((s?: string) => s?.[1]);
    it('applies optional to the chain', () => {
      const notOptionalStateLetter = getAddressFromPerson
        .pipe(getStateFromAddress)
        .pipe(getSecondLetter);
      expect(notOptionalStateLetter(alice)).toBe('a');
      expect(() => notOptionalStateLetter(bob)).toThrow();
      expect(() => notOptionalStateLetter(charlie)).toThrow();

      const notOptionalCityLetter = getAddressFromPerson
        .pipe(getCityFromAddress)
        .pipe(getSecondLetter);
      expect(notOptionalCityLetter(alice)).toBe('a');
      expect(notOptionalCityLetter(bob)).toBe('e');
      expect(() => notOptionalCityLetter(charlie)).toThrow();

      const midOptionalStateLetter = getAddressFromPerson // address is required
        .pipe(getStateFromAddress) // state is optional, turning the whole chain optional
        .optional.pipe(getSecondLetter); // letter is required
      expect(midOptionalStateLetter(alice)).toBe('a');
      expect(midOptionalStateLetter(bob)).toBeUndefined();
      expect(midOptionalStateLetter(charlie)).toBeUndefined();

      const midOptionalCityLetter = getAddressFromPerson // address is required
        .pipe(getCityFromAddress) // city is optional, turning the whole chain optional
        .optional.pipe(getSecondLetter); // letter is required
      expect(midOptionalCityLetter(alice)).toBe('a');
      expect(midOptionalCityLetter(bob)).toBe('e');
      expect(midOptionalCityLetter(charlie)).toBeUndefined();

      const firstOptionalStateLetter = getAddressFromPerson.optional // address is optional, turning the whole chain optional
        .pipe(getStateFromAddress) // state is required
        .pipe(getSecondLetter); // letter is required
      expect(firstOptionalStateLetter(alice)).toBe('a');
      expect(firstOptionalStateLetter(bob)).toBeUndefined();
      expect(firstOptionalStateLetter(charlie)).toBeUndefined();

      const firstOptionalCityLetter = getAddressFromPerson.optional // address is optional, turning the whole chain optional
        .pipe(getCityFromAddress) // city is required
        .pipe(getSecondLetter); // letter is required
      expect(firstOptionalCityLetter(alice)).toBe('a');
      expect(firstOptionalCityLetter(bob)).toBe('e');
      expect(firstOptionalCityLetter(charlie)).toBeUndefined();
    });

    it('applies required to the chain', () => {
      const allOptionalStateLetter = getAddressFromPerson.optional
        .pipe(getStateFromAddress)
        .optional.pipe(getSecondLetter).optional;
      expect(allOptionalStateLetter.required(alice)).toBe('a');
      expect(() => allOptionalStateLetter.required(bob)).toThrow();
      expect(() => allOptionalStateLetter.required(charlie)).toThrow();

      const allOptionalCityLetter = getAddressFromPerson.optional
        .pipe(getCityFromAddress)
        .optional.pipe(getSecondLetter).optional;
      expect(allOptionalCityLetter.required(alice)).toBe('a');
      expect(allOptionalCityLetter.required(bob)).toBe('e');
      expect(() => allOptionalCityLetter.required(charlie)).toThrow();
    });
  });
});
