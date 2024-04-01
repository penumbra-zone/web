import { Address } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { TransactionPlannerRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { Code, ConnectError } from '@connectrpc/connect';

export const assertSwapClaimAddressesBelongToCurrentUser = (
  transactionPlannerRequest: TransactionPlannerRequest,
  isControlledAddress: (address?: Address) => boolean,
): void => {
  transactionPlannerRequest.swaps.forEach(swap => {
    if (!isControlledAddress(swap.claimAddress)) {
      throw new ConnectError(
        "Tried to initiate a swap with a claim address belonging to a different user. This means that, when the swap is claimed, the funds would go to someone else's address, not yours. This should never happen. The website you are using may be trying to steal your funds!",
        Code.InvalidArgument,
      );
    }
  });
};
