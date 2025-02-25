import { ViewService } from '@penumbra-zone/protobuf';
import { penumbra } from '../penumbra';
import { CallOptions } from '@connectrpc/connect';
import { PlainMessage, toPlainMessage } from '@bufbuild/protobuf';
import {
  StatusResponse,
  StatusStreamResponse,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';

export const getInitialStatus = async (opt?: CallOptions): Promise<PlainMessage<StatusResponse>> =>
  toPlainMessage(await penumbra.service(ViewService).status({}, opt));

export async function* getStatusStream(
  opt?: CallOptions,
): AsyncGenerator<PlainMessage<StatusStreamResponse>> {
  for await (const item of penumbra
    .service(ViewService)
    .statusStream({}, { timeoutMs: 15_000, ...opt })) {
    yield toPlainMessage(item);
  }
}
