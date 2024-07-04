import { describe, expect, it } from 'vitest';
import { AssetId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import {
  TransactionPlannerRequest,
  TransactionPlannerRequest_Output,
  TransactionPlannerRequest_Swap,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { extractAltFee } from './fees';

describe('extractAltFee', () => {
  it('extracts the fee from outputs', () => {
    const umAssetId = new AssetId({ altBaseDenom: 'UM' });
    const request = new TransactionPlannerRequest({
      outputs: [
        new TransactionPlannerRequest_Output({
          value: { assetId: umAssetId },
        }),
      ],
    });
    const result = extractAltFee(request);
    expect(result.equals(umAssetId)).toBeTruthy();
  });

  it('skips over outputs that do not have assetIds', () => {
    const umAssetId = new AssetId({ altBaseDenom: 'UM' });
    const request = new TransactionPlannerRequest({
      outputs: [
        new TransactionPlannerRequest_Output({}),
        new TransactionPlannerRequest_Output({
          value: { assetId: umAssetId },
        }),
      ],
    });
    const result = extractAltFee(request);
    expect(result.equals(umAssetId)).toBeTruthy();
  });

  it('prioritizes outputs over all else', () => {
    const outputAssetId = new AssetId({ altBaseDenom: 'output' });
    const swapAssetId = new AssetId({ altBaseDenom: 'swap' });

    const request = new TransactionPlannerRequest({
      outputs: [
        new TransactionPlannerRequest_Output({
          value: { assetId: outputAssetId },
        }),
      ],
      swaps: [
        new TransactionPlannerRequest_Swap({
          value: { assetId: swapAssetId },
        }),
      ],
    });

    const result = extractAltFee(request);
    expect(result.equals(outputAssetId)).toBeTruthy();
  });

  it('extracts the fee from swaps', () => {
    const swapAssetId = new AssetId({ altBaseDenom: 'swap' });
    const request = new TransactionPlannerRequest({
      swaps: [
        new TransactionPlannerRequest_Swap({
          value: { assetId: swapAssetId },
        }),
      ],
    });

    const result = extractAltFee(request);
    expect(result.equals(swapAssetId)).toBeTruthy();
  });

  it('throws an error when no asset ID is found', () => {
    const request = new TransactionPlannerRequest({});

    expect(() => extractAltFee(request)).toThrow(
      'Could not extract alternative fee assetId from TransactionPlannerRequest',
    );
  });
});
