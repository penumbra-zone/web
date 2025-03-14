import { ViewService } from '@penumbra-zone/protobuf';
import { penumbra } from '../penumbra';
import { CallOptions } from '@connectrpc/connect';
import {
  StatusResponse,
  StatusResponseSchema,
  StatusStreamResponse,
  StatusStreamResponseSchema,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { create } from '@bufbuild/protobuf';

export const getInitialStatus = async (opt?: CallOptions): Promise<StatusResponse> =>
  create(StatusResponseSchema, await penumbra.service(ViewService).status({}, opt));

/**
 * Stream status updates. Default timeout of 15 seconds unless specified.
 *
 * @param opt connectrpc call options
 */
export async function* getStatusStream(opt?: CallOptions): AsyncGenerator<StatusStreamResponse> {
  for await (const item of penumbra
    .service(ViewService)
    .statusStream({}, { timeoutMs: 15_000, ...opt })) {
    yield create(StatusStreamResponseSchema, item);
  }
}
