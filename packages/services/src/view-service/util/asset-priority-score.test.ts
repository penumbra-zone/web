import { describe, expect, it } from 'vitest';
import { getAssetPriorityScore } from './asset-priority-score.js';
import { AssetId, Metadata } from '@penumbra-zone/protobuf/types';
import { base64ToUint8Array } from '@penumbra-zone/types/base64';

describe('getAssetPriorityScore', () => {
  const umTokenId = 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=';
  const umToken = new AssetId({ inner: base64ToUint8Array(umTokenId) });
  const delegationTokenId = '/5AHh95RAybBbUhQ5zXMWCvstH4rRK/5KMVIVGQltAw=';
  const usdcTokenId = 'A/8PdbaWqFds9NiYzmAN75SehGpkLwr7tgoVmwaIVgg=';

  it('returns 0 for the undefined metadata', () => {
    expect(getAssetPriorityScore(undefined, umToken)).toBe(0n);
  });

  it('returns 10 for an unbonding token', () => {
    const metadata = new Metadata({
      display: 'unbonding_start_at_100_penumbravalid1abc123',
    });

    expect(getAssetPriorityScore(metadata, umToken)).toBe(10n);
  });

  it('returns 20 for a delegation token', () => {
    const metadata = new Metadata({
      display:
        'delegation_penumbravalid1sqwq8p8fqxx4aflthtwmu6kte8je7sh4tj7pyd82qpvdap5ajgrsv0q0ja',
      penumbraAssetId: {
        inner: base64ToUint8Array(delegationTokenId),
      },
    });

    expect(getAssetPriorityScore(metadata, umToken)).toBe(20n);
  });

  it('returns 30 for an auction token', () => {
    const metadata = new Metadata({
      display: 'auctionnft_0_pauctid1abc123',
    });

    expect(getAssetPriorityScore(metadata, umToken)).toBe(30n);
  });

  it('returns 40 for an token within registry', () => {
    const metadata = new Metadata({
      display: 'transfer/channel-7/usdc',
      penumbraAssetId: {
        inner: base64ToUint8Array(usdcTokenId),
      },
    });

    expect(getAssetPriorityScore(metadata, umToken)).toBe(40n);
  });

  it('returns 50 for the UM token', () => {
    const metadata = new Metadata({
      penumbraAssetId: {
        inner: base64ToUint8Array(umTokenId),
      },
    });

    expect(getAssetPriorityScore(metadata, umToken)).toBe(50n);
  });
});
