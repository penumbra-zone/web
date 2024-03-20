import { bech32 } from 'bech32';
import { bech32IsValid } from './validate';
import { describe, expect, test } from 'vitest';

describe('validate Bech32 address', () => {
  test('should return true for a correct Bech32 address without prefix', () => {
    const address = bech32.encode('osmo', bech32.toWords(Buffer.from('test', 'utf8')));
    expect(bech32IsValid(address)).toBeTruthy();
  });

  test('should return true for a correct Bech32 address with prefix', () => {
    const prefix = 'osmo';
    const address = bech32.encode(prefix, bech32.toWords(Buffer.from('test', 'utf8')));
    expect(bech32IsValid(address, prefix)).toBeTruthy();
  });

  test('should return false if the prefix does not match', () => {
    const address = bech32.encode('osmo', bech32.toWords(Buffer.from('test', 'utf8')));
    const wrongPrefix = 'noble';
    expect(bech32IsValid(address, wrongPrefix)).toBeFalsy();
  });

  test('should return false for invalid Bech32 address', () => {
    const address = 'invalidaddress';
    expect(bech32IsValid(address)).toBeFalsy();
  });

  test('should return false for Bech32 address with unexpected prefix when prefix is provided', () => {
    const prefix = 'osmo';
    const address = bech32.encode('noble', bech32.toWords(Buffer.from('test', 'utf8')));
    expect(bech32IsValid(address, prefix)).toBeFalsy();
  });
});
