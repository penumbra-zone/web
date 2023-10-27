import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1alpha1/num_pb';
import { convertFromBaseUnit, joinLoHi, splitLoHi } from './lo-hi';

export const joinLoHiAmount = (amount: Amount): bigint => {
  return joinLoHi(amount.lo, amount.hi);
};

export const convertFromBaseUnitAmount = (amount: Amount, exponent: number): number => {
  return convertFromBaseUnit(amount.lo, amount.hi, exponent);
};

export const addAmounts = (a: Amount, b: Amount): Amount => {
  const joined = joinLoHiAmount(a) + joinLoHiAmount(b);
  const { lo, hi } = splitLoHi(joined);
  return new Amount({ lo, hi });
};

// This function takes a number and formats it in a display-friendly way (en-US locale)
// Examples:
//    2000        -> 2,000
//    2001.1      -> 2,000.1
//    2001.124125 -> 2,001.124
//    0.000012    -> 0.000012
export const displayAmount = (number: number): string => {
  const split = number.toString().split('.');
  const integer = parseInt(split[0]!);
  let decimal = split[1];

  const formattedInt = new Intl.NumberFormat('en-US').format(integer);

  if (!decimal) return formattedInt;

  if (Math.abs(number) >= 1) {
    decimal = decimal.slice(0, 3);
  }

  return `${formattedInt}.${decimal}`;
};

// Takes a number and represents it as a formatted $usd value
//    2000        -> 2,000
//    2001.1      -> 2,000.10
//    2001.124125 -> 2,001.12
//    0.000012    -> 0.00
export const displayUsd = (number: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
};
