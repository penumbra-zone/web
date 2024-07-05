import { describe, expect, it } from 'vitest';
import { AssetId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import {
  TransactionPlannerRequest,
  TransactionPlannerRequest_ActionDutchAuctionEnd,
  TransactionPlannerRequest_ActionDutchAuctionSchedule,
  TransactionPlannerRequest_ActionDutchAuctionWithdraw,
  TransactionPlannerRequest_Output,
  TransactionPlannerRequest_Swap,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { AuctionId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1/auction_pb';

// TODO: Need to properly write tests the coverage
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
    const outputAsset = request.outputs.map(o => o.value?.assetId).find(Boolean);
    expect(outputAsset!.equals(umAssetId)).toBeTruthy();
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
    const outputAsset = request.outputs.map(o => o.value?.assetId).find(Boolean);
    expect(outputAsset!.equals(umAssetId)).toBeTruthy();
  });

  it('prioritizes outputs over all else', () => {
    const outputAssetId = new AssetId({ altBaseDenom: 'output' });
    const swapAssetId = new AssetId({ altBaseDenom: 'swap' });
    const auctionScheduleAssetId = new AssetId({ altBaseDenom: 'auction-schedule' });
    const auctionEndAuctionId = new AuctionId({ inner: new Uint8Array([3, 2, 5, 2]) });
    const auctionWithdrawAuctiontId = new AuctionId({ inner: new Uint8Array([9, 9, 6, 3]) });

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
      dutchAuctionScheduleActions: [
        new TransactionPlannerRequest_ActionDutchAuctionSchedule({
          description: { outputId: auctionScheduleAssetId },
        }),
      ],
      dutchAuctionEndActions: [
        new TransactionPlannerRequest_ActionDutchAuctionEnd({
          auctionId: auctionEndAuctionId,
        }),
      ],
      dutchAuctionWithdrawActions: [
        new TransactionPlannerRequest_ActionDutchAuctionWithdraw({
          auctionId: auctionWithdrawAuctiontId,
        }),
      ],
    });

    const outputAsset = request.outputs.map(o => o.value?.assetId).find(Boolean);
    expect(outputAsset!.equals(outputAssetId)).toBeTruthy();
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

    const swapAsset = request.swaps.map(assetIn => assetIn.value?.assetId).find(Boolean);
    expect(swapAsset!.equals(swapAssetId)).toBeTruthy();
  });
});
