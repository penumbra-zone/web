import { getDisplayDenomExponent } from '@penumbra-zone/getters/metadata';
import { getRateData } from '@penumbra-zone/getters/validator-info';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { TransactionPlannerRequest } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { toBaseUnit } from '@penumbra-zone/types/lo-hi';
import BigNumber from 'bignumber.js';
import { StakingSlice } from '.';

export const assembleDelegateRequest = (
  { account, amount, validatorInfo }: StakingSlice,
  stakingAssetMetadata: Metadata,
) => {
  return new TransactionPlannerRequest({
    delegations: [
      {
        amount: toBaseUnit(BigNumber(amount), getDisplayDenomExponent(stakingAssetMetadata)),
        rateData: getRateData(validatorInfo),
      },
    ],
    source: { account },
  });
};
