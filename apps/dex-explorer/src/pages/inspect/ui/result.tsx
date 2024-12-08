'use client';

import { useParams, useRouter } from 'next/navigation';
import { Text } from '@penumbra-zone/ui/Text';
import { useLpPosition } from '@/pages/inspect/lp/api/position.ts';
import { StateDetails } from '@/pages/inspect/ui/state-details.tsx';
import { VolumeAndFeesTable } from '@/pages/inspect/ui/volume.tsx';
import { Actions } from '@/pages/inspect/ui/actions.tsx';
import { DebugView } from '@/pages/inspect/ui/debug.tsx';
import { Executions } from '@/pages/inspect/ui/executions.tsx';

const ErrorState = ({ error }: { error: unknown }) => {
  return <Text color='destructive.main'>{String(error)}</Text>;
};

export const useLpIdInUrl = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  if (!params?.id) {
    router.push('/inspect');
    return '';
  }
  return params.id;
};

export const LpInspectResult = () => {
  const id = useLpIdInUrl();
  const { error } = useLpPosition(id);

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <section className='w-full border-t border-t-other-solidStroke overflow-x-hidden'>
      <div className='grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-other-solidStroke border-l border-other-solidStroke'>
        {/* First Column */}
        <div className='flex flex-col divide-y divide-other-solidStroke'>
          <div className='p-4 w-full'>
            <StateDetails />
          </div>
          <div className='p-4 w-full'>
            <VolumeAndFeesTable />
          </div>
          <div className='p-4 w-full'>
            <Actions />
          </div>

          {/* DebugView only on larger screens */}
          <div className='hidden lg:block p-4 w-full'>
            <DebugView />
          </div>
        </div>

        {/* Second Column */}
        <div className='flex flex-col divide-y divide-other-solidStroke'>
          <div className='p-4 w-full'>
            <Executions />
          </div>
        </div>
      </div>

      {/* DebugView at the bottom for smaller screens */}
      <div className='mt-4 border-t border-t-other-solidStroke pt-4 lg:hidden'>
        <DebugView />
      </div>
    </section>
  );
};
