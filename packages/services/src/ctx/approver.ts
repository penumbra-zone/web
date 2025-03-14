import { AuthorizeRequest } from '@penumbra-zone/protobuf/penumbra/custody/v1/custody_pb';
import { Code, ConnectError, createContextKey } from '@connectrpc/connect';
import { UserChoice } from '@penumbra-zone/types/user-choice';

export type TxApprovalFn = (authorizeRequest: AuthorizeRequest) => Promise<UserChoice>;
export const approverCtx = createContextKey<TxApprovalFn>(() =>
  Promise.reject(new ConnectError('No user approval method available', Code.FailedPrecondition)),
);
