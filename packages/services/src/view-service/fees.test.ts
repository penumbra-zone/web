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
import { extractAltFee } from './fees';
import { AuctionId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1/auction_pb';

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

  it('extracts the fee from dutchAuctionScheduleActions', () => {
    const auctionScheduleAssetId = new AssetId({ altBaseDenom: 'auction-schedule' });
    const request = new TransactionPlannerRequest({
      dutchAuctionScheduleActions: [
        new TransactionPlannerRequest_ActionDutchAuctionSchedule({
          description: { outputId: auctionScheduleAssetId },
        }),
      ],
    });

    const result = extractAltFee(request);
    expect(result.equals(auctionScheduleAssetId)).toBeTruthy();
  });

  it('extracts the fee from dutchAuctionEndActions', () => {
    const auctionEndAuctionId = new AuctionId({ inner: new Uint8Array([3, 2, 5, 2]) });
    const request = new TransactionPlannerRequest({
      dutchAuctionEndActions: [
        new TransactionPlannerRequest_ActionDutchAuctionEnd({
          auctionId: auctionEndAuctionId,
        }),
      ],
    });

    const result = extractAltFee(request);
    expect(result.inner).toEqual(auctionEndAuctionId.inner);
  });

  it('extracts the fee from dutchAuctionWithdrawActions', () => {
    const auctionWithdrawAuctiontId = new AuctionId({ inner: new Uint8Array([9, 9, 6, 3]) });
    const request = new TransactionPlannerRequest({
      dutchAuctionWithdrawActions: [
        new TransactionPlannerRequest_ActionDutchAuctionWithdraw({
          auctionId: auctionWithdrawAuctiontId,
        }),
      ],
    });

    const result = extractAltFee(request);
    expect(result.inner).toEqual(auctionWithdrawAuctiontId.inner);
  });

  it('throws an error when no asset ID is found', () => {
    const request = new TransactionPlannerRequest({});

    expect(() => extractAltFee(request)).toThrow(
      'Could not extract alternative fee assetId from TransactionPlannerRequest',
    );
  });
});
