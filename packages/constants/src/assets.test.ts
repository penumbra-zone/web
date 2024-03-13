import { describe, expect, it } from 'vitest';
import { assetPatterns } from './assets';

describe('assetPatterns', () => {
  describe('lpNftPattern', () => {
    it('matches when a string begins with `lpnft_`', () => {
      expect(assetPatterns.lpNft.test('lpnft_abc123')).toBe(true);
    });

    it('does not match when a string contains, but does not begin with, `lpnft_`', () => {
      expect(assetPatterns.lpNft.test('ibc-transfer/channel-1234/lpnft_abc123')).toBe(false);
    });
  });

  describe('delegationTokenPattern', () => {
    it('matches when a string is a valid delegation token name', () => {
      expect(assetPatterns.delegationToken.test('delegation_penumbravalid1abc123')).toBe(true);
    });

    it('does not match when a string contains, but does not begin with, a valid delegation token name', () => {
      expect(
        assetPatterns.delegationToken.test(
          'ibc-transfer/channel-1234/delegation_penumbravalid1abc123',
        ),
      ).toBe(false);
    });
  });

  describe('proposalNftPattern', () => {
    it('matches when a string begins with `proposal_`', () => {
      expect(assetPatterns.proposalNft.test('proposal_abc123')).toBe(true);
    });

    it('does not match when a string contains, but does not begin with, `proposal_`', () => {
      expect(assetPatterns.proposalNft.test('ibc-transfer/channel-1234/proposal_abc123')).toBe(
        false,
      );
    });
  });

  describe('unbondingTokenPattern', () => {
    it('matches when a string is a valid unbonding token name', () => {
      expect(assetPatterns.unbondingToken.test('uunbonding_epoch_1_penumbravalid1abc123')).toBe(
        true,
      );
    });

    it('does not match when a string contains, but does not begin with, a valid unbonding token name', () => {
      expect(
        assetPatterns.unbondingToken.test(
          'ibc-transfer/channel-1234/uunbonding_epoch_1_penumbravalid1abc123',
        ),
      ).toBe(false);
    });
  });

  describe('votingReceiptPattern', () => {
    it('matches when a string begins with `voted_on_`', () => {
      expect(assetPatterns.votingReceipt.test('voted_on_abc123')).toBe(true);
    });

    it('does not match when a string contains, but does not begin with, `voted_on_`', () => {
      expect(assetPatterns.votingReceipt.test('ibc-transfer/channel-1234/voted_on_abc123')).toBe(
        false,
      );
    });
  });
});
