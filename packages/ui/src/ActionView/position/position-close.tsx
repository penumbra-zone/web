import { PositionClose } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { ActionViewBaseProps, GetMetadataByAssetId } from '../types';
import { ActionWrapper } from '../shared/wrapper';
import { ActionRow } from '../shared/action-row';
import { bech32mPositionId } from '@penumbra-zone/bech32m/plpid';
import { shorten } from '@penumbra-zone/types/string';

export interface PositionCloseActionProps extends ActionViewBaseProps {
  value: PositionClose;
  getMetadataByAssetId?: GetMetadataByAssetId;
}

export const PositionCloseAction = ({ value }: PositionCloseActionProps) => {
  return (
    <ActionWrapper
      title='Position Close'
      infoRows={
        <>
          {value.positionId && (
            <ActionRow
              label='Position ID'
              info={shorten(bech32mPositionId(value.positionId), 8)}
              copyText={bech32mPositionId(value.positionId)}
            />
          )}
        </>
      }
    />
  );
};
