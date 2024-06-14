import type { JsonValue } from '@bufbuild/protobuf';

export interface InternalMessage<Type extends string, Req, Res> {
  type: Type;
  request: Req;
  response: Res;
}

export interface InternalRequest<M extends InternalMessage<string, unknown, unknown>> {
  type: M['type'];
  request: M['request'];
}

export type InternalResponse<M extends InternalMessage<string, unknown, unknown>> =
  | {
      type: M['type'];
      data: M['response'];
    }
  | {
      type: M['type'];
      error: JsonValue;
    };
