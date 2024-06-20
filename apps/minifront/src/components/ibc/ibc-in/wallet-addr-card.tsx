import { Identicon } from '@penumbra-zone/ui/components/ui/identicon';

interface UserInfoProps {
  address: string;
  username?: string;
}

export const WalletAddrCard = ({ address, username }: UserInfoProps) => {
  return (
    <div className='flex flex-col items-center gap-2 space-y-1 rounded-lg bg-white p-6'>
      <Identicon uniqueIdentifier={address} type='gradient' size={42} />
      <div className='flex items-center justify-center gap-4 text-gray-500'>{address}</div>
      <span className='text-sm font-semibold text-stone-700 sm:text-xl'>{username}</span>
    </div>
  );
};
