import { createContextKey } from '@connectrpc/connect';
import {
  AuthorizeRequest,
  AuthorizeResponse,
} from '@penumbra-zone/protobuf/penumbra/custody/v1/custody_pb';

export const authorizeCtx = createContextKey<
  (authReq: AuthorizeRequest) => Promise<AuthorizeResponse>
>(undefined as never);
