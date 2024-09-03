import { describe, expect, it } from 'vitest';
import { shouldSkipTrialDecrypt } from './skip-trial-decrypt.js';

describe('skipTrialDecrypt()', () => {
  it('should not skip trial decryption if walletCreationBlockHeight is undefined', () => {
    const currentHeight = 0n;
    const walletCreationBlockHeight = undefined;

    const skipTrialDecrypt = shouldSkipTrialDecrypt(walletCreationBlockHeight, currentHeight);

    expect(skipTrialDecrypt).toBe(false);
  });
  it('should not skip trial decryption for genesis block when wallet creation block height is zero', () => {
    const currentHeight = 0n;
    const walletCreationBlockHeight = 0;

    const skipTrialDecrypt = shouldSkipTrialDecrypt(walletCreationBlockHeight, currentHeight);

    expect(skipTrialDecrypt).toBe(false);
  });
  it('should skip trial decryption for genesis block when wallet creation block height is not zero', () => {
    const currentHeight = 0n;
    const walletCreationBlockHeight = 100;

    const skipTrialDecrypt = shouldSkipTrialDecrypt(walletCreationBlockHeight, currentHeight);

    expect(skipTrialDecrypt).toBe(true);
  });
  it('should skip trial decryption for other blocks when wallet creation block height is not zero', () => {
    const currentHeight = 1n;
    const walletCreationBlockHeight = 100;

    const skipTrialDecrypt = shouldSkipTrialDecrypt(walletCreationBlockHeight, currentHeight);

    expect(skipTrialDecrypt).toBe(true);
  });
  it('should not skip trial decryption when wallet creation block height equals current height', () => {
    const currentHeight = 100n;
    const walletCreationBlockHeight = 100;

    const skipTrialDecrypt = shouldSkipTrialDecrypt(walletCreationBlockHeight, currentHeight);

    expect(skipTrialDecrypt).toBe(false);
  });
  it('should not skip trial decryption when wallet creation block height is greater than current height', () => {
    const currentHeight = 200n;
    const walletCreationBlockHeight = 100;

    const skipTrialDecrypt = shouldSkipTrialDecrypt(walletCreationBlockHeight, currentHeight);

    expect(skipTrialDecrypt).toBe(false);
  });
});
