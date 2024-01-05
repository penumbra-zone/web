export enum PopupMsg {
  TransactionApproval = 'TransactionApproval',
}

export enum OffscreenMsg {
  BuildAction = 'BuildAction',
}

export enum ServicesMsg {
  SyncBlocks = 'SyncBlocks',
  ClearCache = 'ClearCache',
}

export type InternalMessageType = PopupMsg | OffscreenMsg | ServicesMsg;

export interface InternalMessage<MT extends InternalMessageType, Req, Res> {
  type: MT;
  request: Req;
  response: Res;
}

export interface InternalRequest<M extends InternalMessage<InternalMessageType, unknown, unknown>> {
  type: M['type'];
  request: M['request'];
}

export type InternalResponse<M extends InternalMessage<InternalMessageType, unknown, unknown>> =
  | {
      type: M['type'];
      data: M['response'];
    }
  | {
      type: M['type'];
      error: unknown;
    };
