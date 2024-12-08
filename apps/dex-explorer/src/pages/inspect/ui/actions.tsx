import { Text } from '@penumbra-zone/ui/Text';
import {
  PositionStateResponse,
  PositionWithdrawal,
} from '@/shared/api/server/position/timeline/types.ts';
import { Card } from '@penumbra-zone/ui/Card';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { TimeDisplay } from '@/pages/inspect/ui/time.tsx';
import { useLpIdInUrl } from '@/pages/inspect/ui/result.tsx';
import { useLpPosition } from '@/pages/inspect/lp/api/position.ts';
import { Skeleton } from '@/shared/ui/skeleton.tsx';

const PositionClosed = ({
  closingTx,
  closingTime,
  closingHeight,
}: {
  closingTime: string;
  closingHeight: number;
  closingTx?: string;
}) => {
  return (
    <Card title='Position Closed'>
      <div className='flex justify-between items-center'>
        <div className='flex flex-col gap-2 flex-shrink min-w-0'>
          {closingTx && (
            <Text color='text.secondary' truncate>
              Tx: {closingTx}
            </Text>
          )}
        </div>

        <div className='ml-4 flex-shrink-0'>
          <TimeDisplay dateStr={closingTime} height={closingHeight} />
        </div>
      </div>
    </Card>
  );
};

const PositionWithdraw = ({ withdrawal }: { withdrawal: PositionWithdrawal }) => {
  return (
    <Card title='Position Withdraw'>
      <div className='flex justify-between items-center'>
        <div className='flex flex-col gap-2 flex-shrink min-w-0'>
          <div className='flex items-center gap-2'>
            <ValueViewComponent valueView={withdrawal.reserves1} abbreviate={false} />
            <ValueViewComponent valueView={withdrawal.reserves2} abbreviate={false} />
          </div>

          <Text color='text.secondary' truncate>
            Tx: {withdrawal.txHash}
          </Text>
        </div>

        <div className='ml-4 flex-shrink-0'>
          <TimeDisplay dateStr={withdrawal.time} height={withdrawal.height} />
        </div>
      </div>
    </Card>
  );
};

const PositionOpen = ({ state }: { state: PositionStateResponse }) => {
  return (
    <Card title='Position Open'>
      <div className='flex justify-between items-center'>
        <div className='flex flex-col gap-2 flex-shrink min-w-0'>
          <div className='flex items-center gap-2'>
            <ValueViewComponent valueView={state.reserves1} abbreviate={false} />
            <ValueViewComponent valueView={state.reserves2} abbreviate={false} />
          </div>

          <Text color='text.secondary' truncate>
            Tx: {state.openingTx}
          </Text>
        </div>

        <div className='ml-4 flex-shrink-0'>
          <TimeDisplay dateStr={state.openingTime} height={state.openingHeight} />
        </div>
      </div>
    </Card>
  );
};

const DataBody = ({
  state,
  withdrawals,
}: {
  state: PositionStateResponse;
  withdrawals: PositionWithdrawal[];
}) => {
  return (
    <div className='flex flex-col gap-4 justify-center'>
      {withdrawals.map((w, i) => (
        <PositionWithdraw key={i} withdrawal={w} />
      ))}
      {state.closingTime && state.closingHeight && (
        <PositionClosed
          closingHeight={state.closingHeight}
          closingTime={state.closingTime}
          closingTx={state.closingTx}
        />
      )}
      <PositionOpen state={state} />
    </div>
  );
};

const LoadingState = ({ count = 2 }: { count?: number }) => {
  const withdrawalSkeletons = Array.from({ length: count });

  return (
    <div className='flex flex-col gap-4'>
      {withdrawalSkeletons.map((_, index) => (
        <Card key={index}>
          <div className='flex justify-between items-center'>
            <div className='flex flex-col gap-2 flex-shrink min-w-0'>
              <div className='flex items-center gap-2'>
                {/* Skeletons for ValueViewComponents */}
                <div className='w-24 h-6'>
                  <Skeleton />
                </div>
                <div className='w-24 h-6'>
                  <Skeleton />
                </div>
              </div>
              <div className='w-32 h-4'>
                <Skeleton />
              </div>
            </div>
            <div className='ml-4 flex-shrink-0'>
              <div className='w-20 h-4'>
                <Skeleton />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export const Actions = () => {
  const id = useLpIdInUrl();
  const { data, isLoading } = useLpPosition(id);

  return (
    <div className='flex flex-col gap-2'>
      <Text xxl color='base.white'>
        Actions
      </Text>
      {isLoading && <LoadingState />}
      {data && <DataBody state={data.state} withdrawals={data.withdrawals} />}
    </div>
  );
};
