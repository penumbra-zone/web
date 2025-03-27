'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AddressView } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { base64ToUint8Array } from '@penumbra-zone/types/base64';
import { AddressViewComponent } from '@penumbra-zone/ui/AddressView';
import { Text } from '@penumbra-zone/ui/Text';
import { PenumbraWaves } from '@/pages/explore/ui/waves';
import { Breadcrumbs } from '@/pages/tournament/ui/breadcrumbs';

export const DelegatorTablePage = () => {
  const router = useRouter();
  const params = useParams<{ address: string }>();

  const address = useMemo(() => {
    if (!params?.address) {
      return undefined;
    }

    return new AddressView({
      addressView: {
        case: 'opaque',
        value: {
          address: {
            inner: base64ToUint8Array(decodeURIComponent(params.address)),
          },
        },
      },
    });
  }, [params]);

  if (!params?.address) {
    router.push('/tournament');
    return null;
  }

  return (
    <section className='flex flex-col gap-6 p-4 max-w-[1062px] mx-auto'>
      <PenumbraWaves />

      <Breadcrumbs
        items={[
          <Link
            href='/tournament'
            className='decoration-0 text-text-secondary hover:text-text-primary transition-colors'
          >
            <Text h4>Tournament</Text>
          </Link>,
          <div className='[&_span]:text-3xl [&>div>div]:max-w-72'>
            <AddressViewComponent addressView={address} truncate hideIcon copyable />
          </div>,
        ]}
      />

      <div className='flex flex-col gap-4 p-6 rounded-lg bg-other-tonalFill5 backdrop-blur-lg'>
        <div className='flex flex-col gap-1'>
          <Text xxl color='text.primary'>
            Total Rewards Earned
          </Text>
          <Text small color='text.secondary'>
            Cumulative from all epochs, voting and LPs rewards
          </Text>
        </div>
      </div>
    </section>
  );
};
