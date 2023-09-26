import { OUTGOING_GRPC_MESSAGE, ResultResponse } from 'penumbra-transport';
import { ViewProtocolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1alpha1/view_connect';
import { ViewProtocolReq, ViewProtocolRes } from './generic';

export const unaryResponse = (
  req: ViewProtocolReq,
  result: ViewProtocolRes,
): ResultResponse<typeof ViewProtocolService> => {
  return {
    type: OUTGOING_GRPC_MESSAGE,
    sequence: req.sequence,
    requestTypeName: req.requestTypeName,
    serviceTypeName: req.serviceTypeName,
    result,
  };
};
