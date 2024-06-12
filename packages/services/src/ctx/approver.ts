import { AuthorizeRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/custody/v1/custody_pb';
import { PartialMessage } from '@bufbuild/protobuf';
import { Code, ConnectError, createContextKey } from '@connectrpc/connect';

export enum UserChoice {
  Approved = 'Approved',
  Denied = 'Denied',
  Ignored = 'Ignored',
}

export type TxApprovalFn = (
  authorizeRequest: PartialMessage<AuthorizeRequest>,
) => Promise<UserChoice>;
export const approverCtx = createContextKey<TxApprovalFn>(() =>
  Promise.reject(new ConnectError('No user approval method available', Code.FailedPrecondition)),
);
