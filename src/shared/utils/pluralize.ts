import { shortify } from '@penumbra-zone/types/shortify';

/**
 * Concatenates a number with a pluralized word based on this number in English.
 *
 * Examples:
 * - `pluralize(1, 'apple', 'apples')` => '1 apple'
 * - `pluralize(2, 'apple', 'apples')` => '2 apples'
 */
export const pluralize = (count: number, singular: string, plural: string): string => {
  const pluralRules = new Intl.PluralRules('en', { type: 'cardinal' });
  const rule = pluralRules.select(count);

  if (rule === 'one') {
    return `${count} ${singular}`;
  }

  return `${count} ${plural}`;
};

/**
 * Concatenates a number with a pluralized word based on this number in English.
 * If the number is larger that a thousand, it shortens it with a suffix.
 *
 * Examples:
 * - `pluralizeAndShortify(1, 'apple', 'apples')` => '1 apple'
 * - `pluralizeAndShortify(2, 'apple', 'apples')` => '2 apples'
 * - `pluralizeAndShortify(991, 'apple', 'apples')` => '991 apple'
 * - `pluralizeAndShortify(1_001, 'apple', 'apples')` => '1K apples'
 * - `pluralizeAndShortify(1_000_001, 'apple', 'apples')` => '1M apples'
 */
export const pluralizeAndShortify = (count: number, singular: string, plural: string): string => {
  const short = shortify(count);

  // if the number was shortened with a suffix, use plural form only
  if (isNaN(Number(short))) {
    return `${short} ${plural}`;
  }

  // otherwise perform correct pluralization
  return pluralize(count, singular, plural);
};
