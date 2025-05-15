'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Address, AddressView } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { addressFromBech32m } from '@penumbra-zone/bech32m/penumbra';
import { AddressViewComponent } from '@penumbra-zone/ui/AddressView';
import { Text } from '@penumbra-zone/ui/Text';
import { PenumbraWaves } from '@/pages/explore/ui/waves';
import { Breadcrumbs } from '../breadcrumbs';
import { DelegatorRewards } from './delegator-rewards';

export const DelegatorTablePage = () => {
  const router = useRouter();
  const params = useParams<{ address: string }>();

  const address = useMemo(() => {
    if (!params?.address) {
      return undefined;
    }

    return new Address(addressFromBech32m(decodeURIComponent(params.address)));
  }, [params]);

  if (!address) {
    router.push('/tournament');
    return null;
  }

  const addressView = new AddressView({
    addressView: {
      case: 'opaque',
      value: {
        address,
      },
    },
  });

  return (
    <section className='flex flex-col gap-6 p-4 max-w-[1168px] mx-auto'>
      <PenumbraWaves />

      <Breadcrumbs
        items={[
          <Link
            key='link'
            href='/tournament'
            className='decoration-0 text-text-secondary hover:text-text-primary transition-colors'
          >
            <Text h4>Tournament</Text>
          </Link>,
          <div key='address' className='[&_span]:text-3xl [&>div>div]:max-w-72'>
            <AddressViewComponent addressView={addressView} truncate hideIcon copyable />
          </div>,
        ]}
      />

      <DelegatorRewards address={address} />
    </section>
  );
};
