import { describe, expect, test } from 'vitest';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { customizeSymbol } from './customize-symbol';

describe('Customizing metadata', () => {
  test('should work for delegation token', () => {
    const metadata = new Metadata({
      display:
        'delegation_penumbravalid1fjuj67ayaqueqxg03d65ps5aah6m39u39qeacu3zv2cw3dzxssyq3yrcez',
    });

    expect(customizeSymbol(metadata).symbol).toBe('delUM(fjuj67ay…)');
  });

  test('should work for unbonding token', () => {
    const metadata = new Metadata({
      display:
        'unbonding_start_at_29_penumbravalid1fjuj67ayaqueqxg03d65ps5aah6m39u39qeacu3zv2cw3dzxssyq3yrcez',
    });

    expect(customizeSymbol(metadata).symbol).toBe('unbondUMat29(fjuj67ay…)');
  });

  test('should do nothing if no matches', () => {
    const metadata = new Metadata({
      display: 'test_usd',
      symbol: 'usdc',
    });

    expect(customizeSymbol(metadata).symbol).toBe('usdc');
  });
});
