import { Text } from '@penumbra-zone/ui/Text';
import { Card } from '@penumbra-zone/ui/Card';
import { Density } from '@penumbra-zone/ui/Density';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { Icon } from '@penumbra-zone/ui/Icon';
import { ArrowRight } from 'lucide-react';
import { AssetIcon } from '@penumbra-zone/ui/AssetIcon';
import { TimeDisplay } from '@/pages/inspect/ui/time.tsx';
import { useLpIdInUrl } from '@/pages/inspect/ui/result.tsx';
import { useLpPosition } from '@/pages/inspect/lp/api/position.ts';
import { Skeleton } from '@/shared/ui/skeleton.tsx';
import { PositionClosed, PositionOpen, PositionWithdraw } from '@/pages/inspect/ui/actions.tsx';
import {
  PositionExecutionsVV,
  PositionExecutionVV,
  PositionStateVV,
  PositionWithdrawalVV,
} from '@/pages/inspect/lp/api/types.ts';

const Execution = ({ execution: e }: { execution: PositionExecutionVV }) => {
  return (
    <div className='mb-4 grid grid-cols-6 items-center'>
      <div className='col-span-2'>
        <TimeDisplay dateStr={e.time} height={e.height} />
      </div>
      <div className='col-span-4'>
        <Card>
          <Density compact>
            <div className='flex flex-col gap-2'>
              <div className='flex items-end gap-2'>
                <div className='flex flex-col items-start gap-1'>
                  <ValueViewComponent valueView={e.input} abbreviate={false} />
                  <Text color='text.secondary' xxs>
                    Trade Input
                  </Text>
                </div>
                <div className='flex items-center pb-5'>
                  <Icon IconComponent={ArrowRight} color='text.primary' size='sm' />
                </div>
                <div className='flex flex-col items-start gap-1'>
                  <ValueViewComponent valueView={e.output} abbreviate={false} />
                  <Text color='text.secondary' xxs>
                    Trade Output
                  </Text>
                </div>
                <div className='flex flex-col items-start gap-1'>
                  <ValueViewComponent valueView={e.fee} priority='secondary' abbreviate={false} />
                  <Text color='text.secondary' xxs>
                    LP Fee
                  </Text>
                </div>
              </div>
              <div className='flex items-end justify-between gap-2'>
                <div className='flex items-center gap-2'>
                  <Text color='text.secondary' small>
                    Routing
                  </Text>
                  <AssetIcon metadata={e.contextStart} />
                  <Icon IconComponent={ArrowRight} color='text.primary' size='sm' />
                  <AssetIcon metadata={e.contextEnd} />
                </div>
                <div className='flex flex-col items-end gap-1'>
                  <Text color='text.secondary' xxs>
                    New Reserves
                  </Text>
                  <div className='flex items-center gap-2'>
                    <ValueViewComponent
                      valueView={e.reserves1}
                      context='table'
                      abbreviate={false}
                    />
                    <ValueViewComponent
                      valueView={e.reserves2}
                      context='table'
                      abbreviate={false}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Density>
        </Card>
      </div>
    </div>
  );
};

const DataBody = ({
  state,
  withdrawals,
  executions,
}: {
  state: PositionStateVV;
  withdrawals: PositionWithdrawalVV[];
  executions: PositionExecutionsVV;
}) => {
  return (
    <div>
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
      {executions.items.length === 0 && (
        <Text detail color='text.secondary'>
          No executions
        </Text>
      )}
      {executions.items.map((e, i) => (
        <div key={i}>
          <Execution execution={e} />
        </div>
      ))}
      {executions.skipped > 0 && (
        <div className='mb-4 grid grid-cols-6 items-center'>
          <div className='col-span-2'></div>
          <div className='col-span-4'>
            <Card>
              <div className='text-center'>
                <Text color='text.secondary'>{executions.skipped} more executions skipped</Text>
              </div>
            </Card>
          </div>
        </div>
      )}
      <PositionOpen state={state} />
    </div>
  );
};

const skeletonRows = 6;

const LoadingState = () => {
  return (
    <div className='flex flex-col gap-2'>
      {[...Array<undefined>(skeletonRows)].map((_, index) => (
        <div key={index} className='mb-4 grid grid-cols-6 items-center'>
          <div className='col-span-2'>
            <div className='flex flex-col gap-1'>
              <div className='h-5 w-24' aria-hidden='true'>
                <Skeleton />
              </div>
              <div className='h-4 w-16' aria-hidden='true'>
                <Skeleton />
              </div>
            </div>
          </div>
          <div className='col-span-4'>
            <Card>
              <div className='flex flex-col gap-4'>
                <div className='flex items-end gap-8'>
                  <div className='flex flex-col gap-1'>
                    <div className='h-6 w-32' aria-hidden='true'>
                      <Skeleton />
                    </div>
                    <div className='h-3 w-16' aria-hidden='true'>
                      <Skeleton />
                    </div>
                  </div>
                  <div className='flex flex-col gap-1'>
                    <div className='h-6 w-32' aria-hidden='true'>
                      <Skeleton />
                    </div>
                    <div className='h-3 w-16' aria-hidden='true'>
                      <Skeleton />
                    </div>
                  </div>
                  <div className='flex flex-col gap-1'>
                    <div className='h-6 w-32' aria-hidden='true'>
                      <Skeleton />
                    </div>
                    <div className='h-3 w-16' aria-hidden='true'>
                      <Skeleton />
                    </div>
                  </div>
                </div>
                <div className='flex items-end justify-between'>
                  <div className='flex items-center gap-2'>
                    <div className='h-4 w-16' aria-hidden='true'>
                      <Skeleton />
                    </div>
                    <div className='h-8 w-8 rounded-full' aria-hidden='true'>
                      <Skeleton />
                    </div>
                    <div className='h-4 w-4' aria-hidden='true'>
                      <Skeleton />
                    </div>
                    <div className='h-8 w-8 rounded-full' aria-hidden='true'>
                      <Skeleton />
                    </div>
                  </div>
                  <div className='flex flex-col items-end gap-1'>
                    <div className='h-3 w-20' aria-hidden='true'>
                      <Skeleton />
                    </div>
                    <div className='flex gap-2'>
                      <div className='h-6 w-32' aria-hidden='true'>
                        <Skeleton />
                      </div>
                      <div className='h-6 w-32' aria-hidden='true'>
                        <Skeleton />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ))}
    </div>
  );
};

export const Timeline = () => {
  const id = useLpIdInUrl();
  const { data, isLoading } = useLpPosition(id);

  return (
    <div className='flex flex-col gap-2'>
      <Text xxl color='base.white'>
        Position Timeline
      </Text>
      {isLoading && <LoadingState />}
      {data && (
        <DataBody state={data.state} withdrawals={data.withdrawals} executions={data.executions} />
      )}
    </div>
  );
};
