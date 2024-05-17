import { BadgeAlert, BadgeCheck } from 'lucide-react';
import type { Result as TResult } from './types';

export const Result = ({ result }: { result?: TResult }) => {
  if (!result) return null;

  if (result.belongsToWallet) {
    return (
      <div className='flex items-center gap-2'>
        <BadgeCheck className='text-green' />

        <div className='flex flex-col'>
          Belongs to this wallet
          <span className='text-xs text-muted-foreground'>
            Account #{result.addressIndexAccount}
            {result.ibc && (
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
