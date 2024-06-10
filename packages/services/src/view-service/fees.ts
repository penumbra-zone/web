import { AssetId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import {
  TransactionPlannerRequest,
  TransactionPlannerRequest_Output,
  TransactionPlannerRequest_Swap,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';

export const extractAltFee = (request: TransactionPlannerRequest): AssetId => {
  const fields = [
    { name: 'outputs', value: request.outputs },
    { name: 'swaps', value: request.swaps },
    { name: 'swapClaims', value: request.swapClaims },
    { name: 'delegations', value: request.delegations },
    { name: 'undelegations', value: request.undelegations },
    { name: 'undelegationClaims', value: request.undelegationClaims },
    { name: 'ibcRelayActions', value: request.ibcRelayActions },
    { name: 'ics20Withdrawals', value: request.ics20Withdrawals },
    { name: 'positionOpens', value: request.positionOpens },
    { name: 'positionCloses', value: request.positionCloses },
    { name: 'positionWithdraws', value: request.positionWithdraws },
    { name: 'dutchAuctionScheduleActions', value: request.dutchAuctionScheduleActions },
  ];

  const nonEmptyField = fields.find(field => field.value.length > 0);

  type PossibleTypes = TransactionPlannerRequest_Output | TransactionPlannerRequest_Swap;

  let action = nonEmptyField!.value[0] as PossibleTypes;
  let assetId = action.value?.assetId!;

  return assetId;
};
