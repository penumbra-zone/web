import { AssetId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { Ics20Withdrawal } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/ibc/v1/ibc_pb';
import {
  TransactionPlannerRequest,
  TransactionPlannerRequest_ActionDutchAuctionEnd,
  TransactionPlannerRequest_ActionDutchAuctionSchedule,
  TransactionPlannerRequest_ActionDutchAuctionWithdraw,
  TransactionPlannerRequest_Output,
  TransactionPlannerRequest_Swap,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';

export const extractAltFee = (request: TransactionPlannerRequest): AssetId | undefined => {
  const fields = [
    { name: 'outputs', value: request.outputs },
    { name: 'swaps', value: request.swaps },
    { name: 'dutchAuctionScheduleActions', value: request.dutchAuctionScheduleActions },
    { name: 'dutchAuctionEndActions', value: request.dutchAuctionEndActions },
    { name: 'dutchAuctionWithdrawActions', value: request.dutchAuctionWithdrawActions },
  ];

  const nonEmptyField = fields.find(field => field.value.length > 0);

  if (!nonEmptyField) {
    console.warn('No non-empty field found in the request.');
    return undefined;
  }

  // Note: expand the possible types as we expand our support to more actions in the future.
  type PossibleTypes =
    | TransactionPlannerRequest_Output
    | TransactionPlannerRequest_Swap
    | TransactionPlannerRequest_ActionDutchAuctionSchedule
    | TransactionPlannerRequest_ActionDutchAuctionEnd
    | TransactionPlannerRequest_ActionDutchAuctionWithdraw;

  const action = nonEmptyField.value[0] as PossibleTypes;

  switch (nonEmptyField.name) {
    case 'outputs':
      return (action as TransactionPlannerRequest_Output).value?.assetId;
    case 'swaps':
      return (action as TransactionPlannerRequest_Swap).value?.assetId;
    case 'dutchAuctionScheduleActions':
      return (action as TransactionPlannerRequest_ActionDutchAuctionSchedule).description?.outputId;
    case 'dutchAuctionEndActions':
      return new AssetId({
        inner: (action as TransactionPlannerRequest_ActionDutchAuctionEnd).auctionId?.inner,
      });
    case 'dutchAuctionWithdrawActions':
      return new AssetId({
        inner: (action as TransactionPlannerRequest_ActionDutchAuctionWithdraw).auctionId?.inner,
      });
    default:
      console.warn('Unsupported action type.');
      return undefined;
  }
};
