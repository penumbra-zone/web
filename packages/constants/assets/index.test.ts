import { describe, expect, it } from 'vitest';
import { assetPatterns } from '.';

describe('assetPatterns', () => {
  describe('lpNftPattern', () => {
    it('matches when a string begins with `lpnft_`', () => {
      expect(assetPatterns.lpNftPattern.test('lpnft_abc123')).toBe(true);
    });

    it('does not match when a string contains, but does not begin with, `lpnft_`', () => {
      expect(assetPatterns.lpNftPattern.test('ibc-transfer/channel-1234/lpnft_abc123')).toBe(false);
    });
  });

  describe('delegationTokenPattern', () => {
    it('matches when a string begins with `delegation_`', () => {
      expect(assetPatterns.delegationTokenPattern.test('delegation_abc123')).toBe(true);
    });

    it('does not match when a string contains, but does not begin with, `delegation_`', () => {
      expect(
        assetPatterns.delegationTokenPattern.test('ibc-transfer/channel-1234/delegation_abc123'),
      ).toBe(false);
    });
  });

  describe('proposalNftPattern', () => {
    it('matches when a string begins with `proposal_`', () => {
      expect(assetPatterns.proposalNftPattern.test('proposal_abc123')).toBe(true);
    });

    it('does not match when a string contains, but does not begin with, `proposal_`', () => {
      expect(
        assetPatterns.proposalNftPattern.test('ibc-transfer/channel-1234/proposal_abc123'),
      ).toBe(false);
    });
  });

  describe('unbondingTokenPattern', () => {
    it('matches when a string begins with `uunbonding_epoch_N_`', () => {
      expect(assetPatterns.unbondingTokenPattern.test('uunbonding_epoch_1_abc123')).toBe(true);
    });

    it('does not match when a string contains, but does not begin with, `uunbonding_epoch_N_`', () => {
      expect(
        assetPatterns.unbondingTokenPattern.test(
          'ibc-transfer/channel-1234/uunbonding_epoch_1_abc123',
        ),
      ).toBe(false);
    });
  });

  describe('votingReceiptPattern', () => {
    it('matches when a string begins with `voted_on_`', () => {
      expect(assetPatterns.votingReceiptPattern.test('voted_on_abc123')).toBe(true);
    });

    it('does not match when a string contains, but does not begin with, `voted_on_`', () => {
      expect(
        assetPatterns.votingReceiptPattern.test('ibc-transfer/channel-1234/voted_on_abc123'),
      ).toBe(false);
    });
  });
});
