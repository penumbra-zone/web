import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { getDisplayDenomFromView } from '@penumbra-zone/types';
import { Button } from '@penumbra-zone/ui';
import { ValueViewComponent } from '@penumbra-zone/ui/components/ui/tx/view/value';

export const StakingActions = ({
  delegationTokens,
  unbondingTokens,
  canDelegate,
}: {
  delegationTokens?: ValueView;
  unbondingTokens?: ValueView;
  canDelegate: boolean;
}) => {
  const hasTokens = !!delegationTokens || !!unbondingTokens;

  const handleClickAction = () => alert('Not yet implemented; coming soon!');

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex gap-2'>
        <Button className='px-4' disabled={!canDelegate} onClick={handleClickAction}>
          Delegate
        </Button>
        <Button
          variant='secondary'
          className='px-4'
          disabled={!hasTokens}
          onClick={handleClickAction}
        >
          Undelegate
        </Button>
      </div>

      {hasTokens && (
        <div>
          {delegationTokens && (
            <ValueViewComponent
              key={getDisplayDenomFromView(delegationTokens)}
              view={delegationTokens}
              showIcon={false}
            />
          )}

          {unbondingTokens && (
            <ValueViewComponent
              key={getDisplayDenomFromView(unbondingTokens)}
              view={unbondingTokens}
              showIcon={false}
            />
          )}
        </div>
      )}
    </div>
  );
};
