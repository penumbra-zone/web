import { PositionExecutions } from '@/shared/api/server/position/timeline/types.ts';
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

const DataBody = ({ executions }: { executions: PositionExecutions }) => {
  return (
    <div>
      {executions.items.length === 0 && (
        <Text detail color='text.secondary'>
          None
        </Text>
      )}
      {executions.items.map((e, i) => (
        <div key={i} className='grid grid-cols-6 items-center mb-4'>
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
                      <ValueViewComponent
                        valueView={e.fee}
                        priority='secondary'
                        abbreviate={false}
                      />
                      <Text color='text.secondary' xxs>
                        LP Fee
                      </Text>
                    </div>
                  </div>
                  <div className='flex justify-between items-end gap-2'>
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
      ))}
      {executions.skipped > 0 && (
        <div className='grid grid-cols-6 items-center mb-4'>
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
    </div>
  );
};

const skeletonRows = 6;

const LoadingState = () => {
  return (
    <div className='flex flex-col gap-2'>
      {[...Array<undefined>(skeletonRows)].map((_, index) => (
        <div key={index} className='grid grid-cols-6 items-center mb-4'>
          <div className='col-span-2'>
            <div className='flex flex-col gap-1'>
              <div className='w-24 h-5' aria-hidden='true'>
                <Skeleton />
              </div>
              <div className='w-16 h-4' aria-hidden='true'>
                <Skeleton />
              </div>
            </div>
          </div>
          <div className='col-span-4'>
            <Card>
              <div className='flex flex-col gap-4'>
                <div className='flex items-end gap-8'>
                  <div className='flex flex-col gap-1'>
                    <div className='w-32 h-6' aria-hidden='true'>
                      <Skeleton />
                    </div>
                    <div className='w-16 h-3' aria-hidden='true'>
                      <Skeleton />
                    </div>
                  </div>
                  <div className='flex flex-col gap-1'>
                    <div className='w-32 h-6' aria-hidden='true'>
                      <Skeleton />
                    </div>
                    <div className='w-16 h-3' aria-hidden='true'>
                      <Skeleton />
                    </div>
                  </div>
                  <div className='flex flex-col gap-1'>
                    <div className='w-32 h-6' aria-hidden='true'>
                      <Skeleton />
                    </div>
                    <div className='w-16 h-3' aria-hidden='true'>
                      <Skeleton />
                    </div>
                  </div>
                </div>
                <div className='flex justify-between items-end'>
                  <div className='flex items-center gap-2'>
                    <div className='w-16 h-4' aria-hidden='true'>
                      <Skeleton />
                    </div>
                    <div className='w-8 h-8 rounded-full' aria-hidden='true'>
                      <Skeleton />
                    </div>
                    <div className='w-4 h-4' aria-hidden='true'>
                      <Skeleton />
                    </div>
                    <div className='w-8 h-8 rounded-full' aria-hidden='true'>
                      <Skeleton />
                    </div>
                  </div>
                  <div className='flex flex-col items-end gap-1'>
                    <div className='w-20 h-3' aria-hidden='true'>
                      <Skeleton />
                    </div>
                    <div className='flex gap-2'>
                      <div className='w-32 h-6' aria-hidden='true'>
                        <Skeleton />
                      </div>
                      <div className='w-32 h-6' aria-hidden='true'>
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

export const Executions = () => {
  const id = useLpIdInUrl();
  const { data, isLoading } = useLpPosition(id);

  return (
    <div className='flex flex-col gap-2'>
      <Text xxl color='base.white'>
        Executions
      </Text>
      {isLoading && <LoadingState />}
      {data && <DataBody executions={data.executions} />}
    </div>
  );
};
