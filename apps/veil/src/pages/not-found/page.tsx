import { XCircle } from 'lucide-react';
import { Text } from '@penumbra-zone/ui/Text';
import { PenumbraWaves } from '@/pages/explore/ui/waves';
import { GoBackLink } from './link';

export const NotFoundPage = () => {
  return (
    <div>
      <PenumbraWaves />

      <section className='mx-auto flex h-[calc(100dvh-80px)] max-w-[1062px] flex-col items-center justify-center gap-6 px-4 pt-8 text-neutral-light desktop:justify-start'>
        <div className='flex grow flex-col items-center justify-center gap-4 desktop:grow-0 desktop:justify-start'>
          <XCircle className='size-12' />
          <Text large>Page not found</Text>
        </div>

        <GoBackLink />
      </section>
    </div>
  );
};
