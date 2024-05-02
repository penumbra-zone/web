import { describe, expect, it } from 'vitest';
import { assetPatterns, RegexMatcher } from './assets';

describe('assetPatterns', () => {
  describe('auctionNft', () => {
    it('matches when a string is a valid auction NFT', () => {
      expect(assetPatterns.auctionNft.matches('auctionnft_0_pauctid1abc123')).toBe(true);
    });

    it('does not match when a string contains, but does not begin with, a valid auction NFT', () => {
      expect(
        assetPatterns.auctionNft.matches('ibc-transfer/channel-1234/auctionnft_0_pauctid1abc123'),
      ).toBe(false);
    });

    it('captures the capture groups correctly', () => {
      const result = assetPatterns.auctionNft.capture('auctionnft_0_pauctid1abc123');
      expect(result).toEqual({ auctionId: 'pauctid1abc123', seqNum: '0' });
    });
  });

  describe('lpNft', () => {
    it('matches when a string begins with `lpnft_`', () => {
      expect(assetPatterns.lpNft.matches('lpnft_abc123')).toBe(true);
    });

    it('does not match when a string contains, but does not begin with, `lpnft_`', () => {
      expect(assetPatterns.lpNft.matches('ibc-transfer/channel-1234/lpnft_abc123')).toBe(false);
    });
  });

  describe('delegationToken', () => {
    it('matches when a string is a valid delegation token name', () => {
      expect(assetPatterns.delegationToken.matches('delegation_penumbravalid1abc123')).toBe(true);
    });

    it('does not match when a string contains, but does not begin with, a valid delegation token name', () => {
      expect(
        assetPatterns.delegationToken.matches(
          'ibc-transfer/channel-1234/delegation_penumbravalid1abc123',
        ),
      ).toBe(false);
    });
  });

  describe('proposalNft', () => {
    it('matches when a string begins with `proposal_`', () => {
      expect(assetPatterns.proposalNft.matches('proposal_abc123')).toBe(true);
    });

    it('does not match when a string contains, but does not begin with, `proposal_`', () => {
      expect(assetPatterns.proposalNft.matches('ibc-transfer/channel-1234/proposal_abc123')).toBe(
        false,
      );
    });
  });

  describe('unbondingToken', () => {
    it('matches when a string is a valid unbonding token name', () => {
      expect(
        assetPatterns.unbondingToken.matches('unbonding_start_at_1_penumbravalid1abc123'),
      ).toBe(true);
    });

    it('captures the unbonding start height', () => {
      const match = assetPatterns.unbondingToken.capture(
        'unbonding_start_at_1_penumbravalid1abc123',
      );
      expect(match?.startAt).toBe('1');
    });

    it('does not match when a string contains, but does not begin with, a valid unbonding token name', () => {
      expect(
        assetPatterns.unbondingToken.matches(
          'ibc-transfer/channel-1234/unbonding_start_at_1_penumbravalid1abc123',
        ),
      ).toBe(false);
    });
  });

  describe('votingReceipt', () => {
    it('matches when a string begins with `voted_on_`', () => {
      expect(assetPatterns.votingReceipt.matches('voted_on_abc123')).toBe(true);
    });

    it('does not match when a string contains, but does not begin with, `voted_on_`', () => {
      expect(assetPatterns.votingReceipt.matches('ibc-transfer/channel-1234/voted_on_abc123')).toBe(
        false,
      );
    });
  });

  describe('ibc', () => {
    it('matches when a string follows the pattern transfer/<channel>/<denom>', () => {
      expect(assetPatterns.ibc.matches('transfer/channel-141/uosmo')).toBeTruthy();
      expect(assetPatterns.ibc.matches('transfer/channel-0/upenumbra')).toBeTruthy();
      expect(assetPatterns.ibc.matches('transfer/channel-0/upenumbra/moo/test')).toBeTruthy();
      expect(assetPatterns.ibc.matches('x/channel-0/upenumbra')).toBeFalsy();
    });

    it('captures channel and denom correctly', () => {
      const match = assetPatterns.ibc.capture('transfer/channel-141/uosmo');
      expect(match?.channel).toBe('channel-141');
      expect(match?.denom).toBe('uosmo');
    });

    it('captures multi-hops', () => {
      const match = assetPatterns.ibc.capture('transfer/channel-141/transfer/channel-42/uosmo');
      expect(match?.channel).toBe('channel-141');
      expect(match?.denom).toBe('transfer/channel-42/uosmo');
    });
  });
});

describe('RegexMatcher', () => {
  describe('RegexMatcher.matches', () => {
    it('should return true when the string matches the regex', () => {
      const regex = /^[a-z]+$/;
      const matcher = new RegexMatcher(regex);
      expect(matcher.matches('abc')).toBe(true);
    });

    it('should return false when the string does not match the regex', () => {
      const regex = /^[a-z]+$/;
      const matcher = new RegexMatcher(regex);
      expect(matcher.matches('123')).toBe(false);
    });
  });

  it('should return undefined if no groups are present', () => {
    const regex = /hello/;
    const matcher = new RegexMatcher(regex);
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    expect(matcher.capture('hello')).toBeUndefined();
  });

  it('should return undefined if the string does not match', () => {
    const regex = /hello/;
    const matcher = new RegexMatcher(regex);
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    expect(matcher.capture('world')).toBeUndefined();
  });

  it('should return typed capture groups object if present', () => {
    interface GreetingSubjectGroups {
      greeting: string;
      subject: string;
    }

    const regex = /(?<greeting>hello) (?<subject>world)/;
    const matcher = new RegexMatcher<GreetingSubjectGroups>(regex);
    const expected: GreetingSubjectGroups = {
      greeting: 'hello',
      subject: 'world',
    };
    expect(matcher.capture('hello world')).toEqual(expected);
  });
});
