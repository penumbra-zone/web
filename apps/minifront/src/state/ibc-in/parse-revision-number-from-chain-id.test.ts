import { describe, expect, it } from 'vitest';
import { parseRevisionNumberFromChainId } from './parse-revision-number-from-chain-id';

describe('parseRevisionNumberFromChainId', () => {
  it('should return 0 for non-epoch formatted chain IDs', () => {
    expect(parseRevisionNumberFromChainId('chain--a-0')).toBe(0n);
    expect(parseRevisionNumberFromChainId('chainA')).toBe(0n);
    expect(parseRevisionNumberFromChainId('plainid-')).toBe(0n);
  });

  it('should parse the revision number correctly from epoch formatted chain IDs', () => {
    expect(parseRevisionNumberFromChainId('ibc-10')).toBe(10n);
    expect(parseRevisionNumberFromChainId('cosmos-hub-97')).toBe(97n);
    expect(parseRevisionNumberFromChainId('testnet-helloworld-2')).toBe(2n);
  });

  it('should handle chain IDs with multiple dashes correctly', () => {
    expect(parseRevisionNumberFromChainId('my-chain-id-45')).toBe(45n);
    expect(parseRevisionNumberFromChainId('another-test-100')).toBe(100n);
  });
});
