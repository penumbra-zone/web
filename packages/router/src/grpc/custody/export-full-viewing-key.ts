import { FullViewingKey } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';
import {
  ExportFullViewingKeyRequest,
  ExportFullViewingKeyResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/custody/v1alpha1/custody_pb';
import { AnyMessage } from '@bufbuild/protobuf';
import { localExtStorage } from '@penumbra-zone/storage';
import { stringToUint8Array } from '@penumbra-zone/types';

export const isExportFullViewingKeyRequest = (
  req: AnyMessage,
): req is ExportFullViewingKeyRequest => {
  return req.getType().typeName === ExportFullViewingKeyRequest.typeName;
};

export const handleExportFullViewingKeyReq = async (): Promise<ExportFullViewingKeyResponse> => {
  const wallets = await localExtStorage.get('wallets');

  if (!wallets.length) return new ExportFullViewingKeyResponse();

  return new ExportFullViewingKeyResponse({
    fullViewingKey: new FullViewingKey({
      inner: stringToUint8Array(wallets[0]!.fullViewingKey),
    }),
  });
};
