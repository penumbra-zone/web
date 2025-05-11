import { PositionRewardClaim } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { ActionWrapper } from '../shared/wrapper';
import { ActionRow } from '../shared/action-row';
import { shorten } from '@penumbra-zone/types/string';
import { bech32mPositionId } from '@penumbra-zone/bech32m/plpid';

export interface PositionRewardClaimActionProps {
  value: PositionRewardClaim;
}

export const PositionRewardClaimAction = ({ value }: PositionRewardClaimActionProps) => {
  return (
    <ActionWrapper
      title='Position Reward Claim'
      infoRows={
        <>
          {value.positionId && (
            <ActionRow
              key='position-id'
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
