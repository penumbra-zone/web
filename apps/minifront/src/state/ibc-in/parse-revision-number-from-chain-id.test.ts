import { describe, expect, test } from 'vitest';
import { parseRevisionNumberFromChainId } from './parse-revision-number-from-chain-id';

describe('parseRevisionNumberFromChainId', () => {
  test('should extract the number at the end of a well-formatted string as a BigInt', () => {
    expect(parseRevisionNumberFromChainId('grand-1')).toEqual(1n);
    expect(parseRevisionNumberFromChainId('osmo-test-5')).toEqual(5n);
    expect(parseRevisionNumberFromChainId('penumbra-testnet-deimos-7')).toEqual(7n);
  });

  test('should throw an error if there is no number at the end', () => {
    expect(() => parseRevisionNumberFromChainId('grand')).toThrow(
      'No revision number found within chain id: grand',
    );
    expect(() => parseRevisionNumberFromChainId('osmo-test-beta')).toThrow(
      'No revision number found within chain id: osmo-test-beta',
    );
  });

  test('should throw an error if the string ends with a hyphen', () => {
    expect(() => parseRevisionNumberFromChainId('test-chain-')).toThrow(
      'No revision number found within chain id: test-chain-',
    );
  });

  test('should throw an error if the string does not contain any hyphens', () => {
    expect(() => parseRevisionNumberFromChainId('testchain5')).toThrow(
      'No revision number found within chain id: testchain5',
    );
  });

  test('should handle cases with multiple hyphens correctly', () => {
    expect(parseRevisionNumberFromChainId('multi-part-chain-id-123')).toEqual(123n);
  });
});
