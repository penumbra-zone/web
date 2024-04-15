import { AuthorizeRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/custody/v1/custody_pb';
import { createContextKey } from '@connectrpc/connect';
import { PartialMessage } from '@bufbuild/protobuf';
import { UserChoice } from '@penumbra-zone/types/src/user-choice';

export type TxApprovalFn = (
  authorizeRequest: PartialMessage<AuthorizeRequest>,
) => Promise<UserChoice>;

export const approverCtx = createContextKey<TxApprovalFn | undefined>(undefined);
