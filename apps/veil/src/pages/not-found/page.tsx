import { XCircle } from 'lucide-react';
import { Text } from '@penumbra-zone/ui/Text';
import { PenumbraWaves } from '@/pages/explore/ui/waves';
import { GoBackLink } from './link';

export const NotFoundPage = () => {
  return (
    <div>
      <PenumbraWaves />

      <section className='h-[calc(100dvh_-_80px)] max-w-[1062px] flex flex-col items-center justify-center desktop:justify-start gap-6 pt-8 px-4 mx-auto text-neutral-light'>
        <div className='flex flex-col gap-4 grow justify-center items-center desktop:justify-start desktop:grow-0'>
          <XCircle className='size-12' />
          <Text large>Page not found</Text>
        </div>

        <GoBackLink />
      </section>
    </div>
  );
};
