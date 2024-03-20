import type { TransactionView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import type { AuthorizeRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/custody/v1/custody_pb';
import type {
  InternalMessage,
  InternalRequest,
  InternalResponse,
} from '@penumbra-zone/types/src/internal-msg/shared';
import type { UserChoice } from '@penumbra-zone/types/src/user-choice';
import type { Jsonified } from '@penumbra-zone/types/src/jsonified';
import { OriginRecord } from '@penumbra-zone/storage';

export enum PopupType {
  TxApproval = 'TxApproval',
  OriginApproval = 'OriginApproval',
}

export type PopupMessage = TxApproval | OriginApproval;
export type PopupRequest<T extends PopupMessage = PopupMessage> = InternalRequest<T>;
export type PopupResponse<T extends PopupMessage = PopupMessage> = InternalResponse<T>;

export type OriginApproval = InternalMessage<
  PopupType.OriginApproval,
  { origin: string; favIconUrl?: string; title?: string; lastRequest?: number },
  null | OriginRecord
>;

export type TxApproval = InternalMessage<
  PopupType.TxApproval,
  {
    authorizeRequest: Jsonified<AuthorizeRequest>;
    transactionView: Jsonified<TransactionView>;
  },
  null | {
    authorizeRequest: Jsonified<AuthorizeRequest>;
    transactionView: Jsonified<TransactionView>;
    choice: UserChoice;
  }
>;

export const isPopupRequest = (req: unknown): req is PopupRequest =>
  req != null &&
  typeof req === 'object' &&
  'request' in req &&
  'type' in req &&
  typeof req.type === 'string' &&
  req.type in PopupType;

export const isOriginApprovalRequest = (req: unknown): req is InternalRequest<OriginApproval> =>
  isPopupRequest(req) && req.type === PopupType.OriginApproval && 'origin' in req.request;

export const isTxApprovalRequest = (req: unknown): req is InternalRequest<TxApproval> =>
  isPopupRequest(req) &&
  req.type === PopupType.TxApproval &&
  'authorizeRequest' in req.request &&
  'transactionView' in req.request;
