import { ViewBox } from '../viewbox';
import { ActionDetails } from './action-details';
import { PositionClose } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { bech32mPositionId } from '@penumbra-zone/bech32m/plpid';

export const PositionCloseComponent = ({ value }: { value: PositionClose }) => {
  return (
    <ViewBox
      label='Position Close'
      visibleContent={
        <ActionDetails>
          {value.positionId && (
            <ActionDetails.Row label='Position ID'>
              {bech32mPositionId(value.positionId)}
            </ActionDetails.Row>
          )}
        </ActionDetails>
      }
    />
  );
};
