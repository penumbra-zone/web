import {
  WalletIdRequest,
  WalletIdResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { localExtStorage } from '@penumbra-zone/storage';
import { WalletId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';
import { stringToUint8Array } from '@penumbra-zone/types';
import { ViewReqMessage } from './router';

export const isWalletIdRequest = (req: ViewReqMessage): req is WalletIdRequest => {
  return req.getType().typeName === WalletIdRequest.typeName;
};

export const handleWalletIdReq = async (): Promise<WalletIdResponse> => {
  const wallets = await localExtStorage.get('wallets');

  if (!wallets.length) return new WalletIdResponse();

  return new WalletIdResponse({
    walletId: new WalletId({ inner: stringToUint8Array(wallets[0]!.id) }),
  });
};
