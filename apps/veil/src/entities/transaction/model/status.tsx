import { ReactNode } from 'react';
import {
  AuthorizeAndBuildResponse,
  BroadcastTransactionResponse,
  WitnessAndBuildResponse,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { Progress } from '@penumbra-zone/ui/Progress';

type BroadcastStatus = BroadcastTransactionResponse['status'];
type BuildStatus = (AuthorizeAndBuildResponse | WitnessAndBuildResponse)['status'];

export const getBroadcastStatusMessage = (label: string, status?: BroadcastStatus) => {
  if (status?.case === 'broadcastSuccess' || status?.case === 'confirmed') {
    return 'Waiting for confirmation';
  }
  return `Emitting ${label} transaction`;
};

export const getBuildStatusDescription = (
  status?: Exclude<BuildStatus, undefined>,
): ReactNode | undefined => {
  if (status?.case === 'buildProgress') {
    return (
      <div className='mt-2'>
        <Progress value={status.value.progress} />
      </div>
    );
  }

  if (status?.case === 'complete') {
    return (
      <div className='mt-2'>
        <Progress value={1} />
      </div>
    );
  }
  return undefined;
};
