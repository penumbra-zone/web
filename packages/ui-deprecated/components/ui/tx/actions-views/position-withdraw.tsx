import { ViewBox } from '../viewbox';
import { ActionDetails } from './action-details';
import { PositionWithdraw } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { bech32mPositionId } from '@penumbra-zone/bech32m/plpid';
import { uint8ArrayToBase64 } from '@penumbra-zone/types/base64';

export const PositionWithdrawComponent = ({ value }: { value: PositionWithdraw }) => {
  return (
    <ViewBox
      label='Position Withdraw'
      visibleContent={
        <ActionDetails>
          {value.positionId && (
            <ActionDetails.Row label='Position ID'>
              {bech32mPositionId(value.positionId)}
            </ActionDetails.Row>
          )}

          <ActionDetails.Row label='Sequence'>
            {value.sequence ? value.sequence.toString() : '0'}
          </ActionDetails.Row>

          {value.reservesCommitment?.inner && (
            <ActionDetails.Row label='Reserves commitment'>
              {uint8ArrayToBase64(value.reservesCommitment.inner)}
            </ActionDetails.Row>
          )}
        </ActionDetails>
      }
    />
  );
};
