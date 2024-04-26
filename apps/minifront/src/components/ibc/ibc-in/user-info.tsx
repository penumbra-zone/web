import { Stack } from '@interchain-ui/react';
import { Identicon } from '@penumbra-zone/ui/components/ui/identicon';
import { ConnectedShowAddress, CopyAddressBtn } from './address-card';
import { WalletStatus } from 'cosmos-kit';

interface UserInfoProps {
  address: string;
  username?: string;
  status: WalletStatus;
}

export const UserInfo = ({ address, username, status }: UserInfoProps) => {
  return (
    <Stack
      direction='vertical'
      space={1}
      attributes={{
        alignItems: 'center',
      }}
    >
      <div className='flex items-center justify-center gap-4'>
        <Identicon uniqueIdentifier={address} type='gradient' size={24} />
        <CopyAddressBtn
          walletStatus={status}
          connected={<ConnectedShowAddress address={address} isLoading={false} />}
        />
      </div>
      <span className='text-sm font-semibold text-stone-700 sm:text-xl'>{username}</span>
    </Stack>
  );
};
