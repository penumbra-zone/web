import { BadgeAlert, BadgeCheck } from 'lucide-react';
import type { AddressOwnershipInfo } from './types';

export const Result = ({
  addressOwnershipInfo,
}: {
  addressOwnershipInfo?: AddressOwnershipInfo;
}) => {
  if (!addressOwnershipInfo) return null;

  if (!addressOwnershipInfo.isValidAddress) {
    return (
      <div className='flex items-center gap-2'>
        <BadgeAlert className='text-red' />
        Invalid address
      </div>
    );
  }

  if (addressOwnershipInfo.belongsToWallet) {
    return (
      <div className='flex items-center gap-2'>
        <BadgeCheck className='text-green' />

        <div className='flex flex-col'>
          Belongs to this wallet
          <span className='text-xs text-muted-foreground'>
            Account #{addressOwnershipInfo.addressIndexAccount}
            {addressOwnershipInfo.isEphemeral && (
              <>
                {' '}
                &bull; <span className='text-rust'>IBC deposit address</span>
              </>
            )}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className='flex items-center gap-2'>
      <BadgeAlert className='text-red' />
      Does not belong to this wallet
    </div>
  );
};
