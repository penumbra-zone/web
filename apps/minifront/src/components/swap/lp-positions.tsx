import { Card } from '@penumbra-zone/ui/components/ui/card';
import { GradientHeader } from '@penumbra-zone/ui/components/ui/gradient-header';
import { useOwnedPositions } from '../../state/swap/lp-positions.ts';
import { bech32mPositionId } from '@penumbra-zone/bech32m/plpid';
import { PositionState_PositionStateEnum } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { ValueViewComponent } from '@penumbra-zone/ui/components/ui/value';
import { Button } from '@penumbra-zone/ui/components/ui/button';
import { cn } from '@penumbra-zone/ui/lib/utils';

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

export const LpPositions = () => {
  const { data, error } = useOwnedPositions();

  return !data?.length ? (
    <div className='hidden xl:block' />
  ) : (
    <Card layout>
      <GradientHeader layout>Limit orders</GradientHeader>
      {!!error && <div>❌ There was an error loading your limit orders: ${String(error)}</div>}
      <div className='flex flex-col gap-4'>
        {data.map(({ position, id, r1ValueView, r2ValueView }) => {
          const bech32Id = bech32mPositionId(id);
          return (
            <div key={bech32Id} className='flex flex-col gap-4 p-2'>
              <div className='flex justify-between gap-2'>
                <div className='flex grow flex-col gap-2'>
                  <div className='flex items-center gap-2'>
                    <div
                      className={cn(
                        'text-white flex items-center justify-center rounded p-1 h-7',
                        position.state?.state === PositionState_PositionStateEnum.OPENED
                          ? 'bg-teal'
                          : 'bg-rust',
                      )}
                    >
                      <span className='mt-1'>{stateToString(position.state?.state)}</span>
                    </div>
                    <div className='max-w-[250px] overflow-hidden truncate text-gray-300 lg:max-w-[400px]'>
                      {bech32Id}
                    </div>
                  </div>
                  <div className='flex flex-wrap gap-2'>
                    <ValueViewComponent view={r1ValueView} />
                    <ValueViewComponent view={r2ValueView} />
                  </div>
                </div>
                <div className='shrink-0'>
                  {position.state?.state === PositionState_PositionStateEnum.OPENED && (
                    <Button size='sm' variant='secondary' className='w-full'>
                      Close
                    </Button>
                  )}
                  {position.state?.state === PositionState_PositionStateEnum.CLOSED && (
                    <Button size='sm' variant='secondary' className='w-full'>
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
