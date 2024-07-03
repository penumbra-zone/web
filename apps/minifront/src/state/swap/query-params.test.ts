import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setSwapQueryParams, getSwapQueryParams } from './query-params';
import { AllSlices } from '..';
import { emptyBalanceResponse } from '../../utils/empty-balance-response';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';

describe('swap query params', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('location', { hash: '#swap' });
  });

  it('parses the query correctly on full data', () => {
    vi.stubGlobal('location', { hash: '#swap?from=TestUSD&to=USDC&account=1' });

    const { from, to, account } = getSwapQueryParams();
    expect(from).toBe('TestUSD');
    expect(to).toBe('USDC');
    expect(account).toBe(1);
  });

  it('parses the query correctly on partial data', () => {
    vi.stubGlobal('location', { hash: 'swap?from=TestUSD' });

    const { from, to, account } = getSwapQueryParams();
    expect(from).toBe('TestUSD');
    expect(to).toBe(undefined);
    expect(account).toBe(undefined);
  });

  it('parses the query correctly on empty data', () => {
    vi.stubGlobal('location', { hash: '' });

    const { from, to, account } = getSwapQueryParams();
    expect(from).toBe(undefined);
    expect(to).toBe(undefined);
    expect(account).toBe(undefined);
  });

  it('parses the query correctly on irrelevant data', () => {
    vi.stubGlobal('location', { hash: 'swap?abc=def&hij=klm' });

    const { from, to, account } = getSwapQueryParams();
    expect(from).toBe(undefined);
    expect(to).toBe(undefined);
    expect(account).toBe(undefined);
  });

  it('sets the hash query correctly', () => {
    const state = {
      swap: {
        assetIn: emptyBalanceResponse(new Metadata({ symbol: 'UM' }), 1),
        assetOut: new Metadata({ symbol: 'USDC' }),
      },
    } as AllSlices;

    setSwapQueryParams(state);

    const hash = window.location.hash;
    expect(hash).toBe('#swap?from=UM&to=USDC&account=1');
  });

  it('sets the hash query correctly on partial data', () => {
    const state = {
      swap: {
        assetIn: emptyBalanceResponse(new Metadata({ symbol: 'UM' })),
      },
    } as AllSlices;

    setSwapQueryParams(state);

    const hash = window.location.hash;
    expect(hash).toBe('#swap?from=UM');
  });
});
