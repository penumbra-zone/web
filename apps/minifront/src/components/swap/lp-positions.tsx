import { Card } from '@penumbra-zone/ui/components/ui/card';
import { GradientHeader } from '@penumbra-zone/ui/components/ui/gradient-header';
import { useOwnedPositions } from '../../state/swap/lp-positions.ts';
import { bech32mPositionId } from '@penumbra-zone/bech32m/plpid';
import { PositionState_PositionStateEnum } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { ValueViewComponent } from '@penumbra-zone/ui/components/ui/value';
import { Button } from '@penumbra-zone/ui/components/ui/button';
import { cn } from '@penumbra-zone/ui/lib/utils';
import { AllSlices } from '../../state';
import { useStoreShallow } from '../../utils/use-store-shallow.ts';

const stateToString = (state?: PositionState_PositionStateEnum): string => {
  switch (state) {
    case PositionState_PositionStateEnum.UNSPECIFIED: {
      return 'UNSPECIFIED';
    }
    case PositionState_PositionStateEnum.OPENED: {
      return 'OPENED';
    }
    case PositionState_PositionStateEnum.CLOSED: {
      return 'CLOSED';
    }
    case PositionState_PositionStateEnum.WITHDRAWN: {
      return 'WITHDRAWN';
    }
    case PositionState_PositionStateEnum.CLAIMED: {
      return 'CLAIMED';
    }
    case undefined: {
      return 'UNSPECIFIED';
    }
  }
};

const lPActionSelector = ({ swap }: AllSlices) => ({
  onAction: swap.lpPositions.onAction,
  txInProgress: swap.txInProgress,
});

export const LpPositions = () => {
  const { data, error } = useOwnedPositions();
  const { onAction, txInProgress } = useStoreShallow(lPActionSelector);

  return !data?.length ? (
    <div className='hidden xl:block' />
  ) : (
    <Card layout>
      <GradientHeader layout>Limit orders</GradientHeader>
      {!!error && <div>❌ There was an error loading your limit orders: ${String(error)}</div>}
      <div className='flex flex-col gap-4'>
        {data.map(p => {
          const bech32Id = bech32mPositionId(p.id);
          return (
            <div key={bech32Id} className='flex flex-col gap-4 p-2'>
              <div className='flex justify-between gap-2'>
                <div className='flex grow flex-col gap-2'>
                  <div className='flex items-center gap-2'>
                    <div
                      className={cn(
                        'text-white flex items-center justify-center rounded p-1 h-7',
                        p.position.state?.state === PositionState_PositionStateEnum.OPENED
                          ? 'bg-teal'
                          : 'bg-rust',
                      )}
                    >
                      <span className='mt-1'>{stateToString(p.position.state?.state)}</span>
                    </div>
                    <div className='max-w-[250px] overflow-hidden truncate text-gray-300 lg:max-w-[400px]'>
                      {bech32Id}
                    </div>
                  </div>
                  <div className='flex flex-wrap gap-2'>
                    <ValueViewComponent view={p.r1ValueView} />
                    <ValueViewComponent view={p.r2ValueView} />
                  </div>
                </div>
                <div className='shrink-0'>
                  {p.position.state?.state === PositionState_PositionStateEnum.OPENED && (
                    <Button
                      size='sm'
                      variant='secondary'
                      className='w-full'
                      disabled={txInProgress}
                      onClick={() => void onAction('positionClose', p)}
                    >
                      Close
                    </Button>
                  )}
                  {p.position.state?.state === PositionState_PositionStateEnum.CLOSED && (
                    <Button
                      size='sm'
                      variant='secondary'
                      className='w-full'
                      disabled={txInProgress}
                      onClick={() => void onAction('positionWithdraw', p)}
                    >
                      Withdraw
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
