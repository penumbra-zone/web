import { describe, expect, it } from 'vitest';
import { getAssetPriorityScore } from './asset-priority-score';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { base64ToUint8Array } from '@penumbra-zone/types/base64';

describe('getAssetPriorityScore', () => {
  const umTokenId = 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=';
  const delegationTokenId = '/5AHh95RAybBbUhQ5zXMWCvstH4rRK/5KMVIVGQltAw=';
  const usdcTokenId = 'A/8PdbaWqFds9NiYzmAN75SehGpkLwr7tgoVmwaIVgg=';
  const registryAssets = new Set<string>([umTokenId, delegationTokenId, usdcTokenId]);

  it('returns 0 for the undefined metadata', () => {
    expect(getAssetPriorityScore(undefined, registryAssets)).toBe(0);
  });

  it('returns 0 for an unknown asset', () => {
    const metadata = new Metadata({
      display: 'transfer/channel-7/random',
      penumbraAssetId: {
        inner: new Uint8Array([1, 2, 3]),
      },
    });

    expect(getAssetPriorityScore(metadata, registryAssets)).toBe(0);
  });

  it('returns 10 for an unbonding token', () => {
    const metadata = new Metadata({
      display: 'unbonding_start_at_100_penumbravalid1abc123',
    });

    expect(getAssetPriorityScore(metadata, registryAssets)).toBe(10);
  });

  it('returns 20 for a delegation token', () => {
    const metadata = new Metadata({
      display:
        'delegation_penumbravalid1sqwq8p8fqxx4aflthtwmu6kte8je7sh4tj7pyd82qpvdap5ajgrsv0q0ja',
      penumbraAssetId: {
        inner: base64ToUint8Array(delegationTokenId),
      },
    });

    expect(getAssetPriorityScore(metadata, registryAssets)).toBe(20);
  });

  it('returns 30 for an auction token', () => {
    const metadata = new Metadata({
      display: 'auctionnft_0_pauctid1abc123',
    });

    expect(getAssetPriorityScore(metadata, registryAssets)).toBe(30);
  });

  it('returns 40 for an token within registry', () => {
    const metadata = new Metadata({
      display: 'transfer/channel-7/usdc',
      penumbraAssetId: {
        inner: base64ToUint8Array(usdcTokenId),
      },
    });

    expect(getAssetPriorityScore(metadata, registryAssets)).toBe(40);
  });

  it('returns 50 for the UM token', () => {
    const metadata = new Metadata({
      penumbraAssetId: {
        inner: base64ToUint8Array(umTokenId),
      },
    });

    expect(getAssetPriorityScore(metadata, registryAssets)).toBe(50);
  });
});
