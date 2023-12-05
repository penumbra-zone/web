import { InternalMessageHandler, Ping } from '@penumbra-zone/types/src/internal-msg/shared';
import { PopupRequest } from '@penumbra-zone/types/src/internal-msg/popup';

export const isPingReq = (req: PopupRequest): req is Ping => {
  return req.type === 'PING';
};

export const handlePingReq: InternalMessageHandler<Ping> = (req, res) => {
  res({ type: 'PING', data: `Acknowledged: ${req}` });
};
