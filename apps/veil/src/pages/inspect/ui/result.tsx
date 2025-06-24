'use client';

import { useParams, useRouter } from 'next/navigation';
import { Text } from '@penumbra-zone/ui/Text';
import { useLpPosition } from '@/pages/inspect/lp/api/position.ts';
import { StateDetails } from '@/pages/inspect/ui/state-details.tsx';
import { VolumeAndFeesTable } from '@/pages/inspect/ui/volume.tsx';
import { DebugView } from '@/pages/inspect/ui/debug.tsx';
import { Timeline } from '@/pages/inspect/ui/executions.tsx';

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
    <section className='w-full overflow-x-hidden border-t border-t-other-solid-stroke'>
      <div className='grid grid-cols-1 divide-y divide-other-solid-stroke border-l border-other-solid-stroke lg:grid-cols-2 lg:divide-x lg:divide-y-0'>
        {/* First Column */}
        <div className='flex flex-col divide-y divide-other-solid-stroke'>
          <div className='w-full p-4'>
            <StateDetails />
          </div>
          <div className='w-full p-4'>
            <Timeline />
          </div>

          {/* DebugView only on larger screens */}
          <div className='hidden w-full p-4 lg:block'>
            <DebugView />
          </div>
        </div>

        {/* Second Column */}
        <div className='flex flex-col divide-y divide-other-solid-stroke'>
          <div className='w-full p-4'>
            <VolumeAndFeesTable />
          </div>
        </div>
      </div>

      {/* DebugView at the bottom for smaller screens */}
      <div className='mt-4 border-t border-t-other-solid-stroke pt-4 lg:hidden'>
        <DebugView />
      </div>
    </section>
  );
};
