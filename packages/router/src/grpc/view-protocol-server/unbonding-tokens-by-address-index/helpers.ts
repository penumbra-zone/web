import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { PartialMessage } from '@bufbuild/protobuf';
import { assetPatterns } from '@penumbra-zone/constants/src/assets';
import { getDisplayFromBalancesResponse } from '@penumbra-zone/getters/src/balances-response';

export const isUnbondingTokenBalance = (balancesResponse: PartialMessage<BalancesResponse>) =>
  assetPatterns.unbondingToken.matches(
    getDisplayFromBalancesResponse(new BalancesResponse(balancesResponse)),
  );
