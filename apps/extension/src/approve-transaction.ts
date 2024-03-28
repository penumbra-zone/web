import { AuthorizeRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/custody/v1/custody_pb';
import { PartialMessage } from '@bufbuild/protobuf';
import type { Jsonified } from '@penumbra-zone/types/src/jsonified';
import { PopupType, TxApproval } from './message/popup';
import { popup } from './popup';

export const approveTransaction = async (
  partialAuthorizeRequest: PartialMessage<AuthorizeRequest>,
) => {
  const authorizeRequest = new AuthorizeRequest(partialAuthorizeRequest);

  const popupResponse = await popup<TxApproval>({
    type: PopupType.TxApproval,
    request: {
      authorizeRequest: new AuthorizeRequest(
        authorizeRequest,
      ).toJson() as Jsonified<AuthorizeRequest>,
    },
  });

  if (popupResponse) {
    const resAuthorizeRequest = AuthorizeRequest.fromJson(popupResponse.authorizeRequest);

    if (!authorizeRequest.equals(resAuthorizeRequest))
      throw new Error('Invalid response from popup');
  }

  return popupResponse?.choice;
};
