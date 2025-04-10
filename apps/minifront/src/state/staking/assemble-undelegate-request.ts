import { getRateData } from '@penumbra-zone/getters/validator-info';
import {
  getAssetIdFromValueView,
  getDisplayDenomExponentFromValueView,
} from '@penumbra-zone/getters/value-view';
import { TransactionPlannerRequest } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { toBaseUnit } from '@penumbra-zone/types/lo-hi';
import { isDelegationTokenForValidator } from '@penumbra-zone/types/staking';
import BigNumber from 'bignumber.js';
import { StakingSlice } from '.';

export const assembleUndelegateRequest = ({
  account,
  amount,
  delegationsByAccount,
  validatorInfo,
}: StakingSlice) => {
  const delegation = delegationsByAccount
    .get(account)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- TODO: justify
    ?.find(delegation => isDelegationTokenForValidator(delegation, validatorInfo!));
  if (!delegation) {
    throw new Error('Tried to assemble undelegate request from account with no delegation tokens');
  }

  return new TransactionPlannerRequest({
    undelegations: [
      {
        rateData: getRateData(validatorInfo),
        value: {
          amount: toBaseUnit(BigNumber(amount), getDisplayDenomExponentFromValueView(delegation)),
          assetId: getAssetIdFromValueView(delegation),
        },
      },
    ],
    source: { account },
  });
};
