export interface InternalMessage<Type extends string, Req, Res> {
  type: Type;
  request: Req;
  response: Res;
  target: string;
}

export type Ping = InternalMessage<'PING', string, string>;

export type MessageResponder<M extends InternalMessage<string, unknown, unknown>> = (
  arg: InternalResponse<M>,
) => void;

// Meant as a helper to annotate message handler functions
// Creates a function: (request) => response out of `InternalMessage`
export type InternalMessageHandler<M extends InternalMessage<string, unknown, unknown>> =
  M['request'] extends undefined
    ? () => M['response']
    : (request: M['request'], response: MessageResponder<M>) => void;

// The awaited response sent back to requestor
export type AwaitedInternalResponse<T> = T extends InternalMessage<infer Type, unknown, infer Res>
  ? { type: Type; data: Awaited<Res> }
  : never;

// The awaitable outputs of the handlers
export type ResponseOf<T> = T extends InternalMessage<string, unknown, infer Res> ? Res : never;

export interface InternalRequest<M extends InternalMessage<string, unknown, unknown>> {
  type: M['type'];
  request: M['request'];
  target?: M['target'];
}

export type InternalResponse<M extends InternalMessage<string, unknown, unknown>> =
  | {
      type: M['type'];
      data: M['response'];
    }
  | {
      type: M['type'];
      error: unknown;
    };
