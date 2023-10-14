'use client';

import { Identicon } from 'ui';
import { useWalletId } from '../../hooks/wallet-id';

export default function WalletId() {
  const walletId = useWalletId();

  return (
    <>
      {walletId && (
        <div className='ml-1 flex items-center gap-3 rounded-lg border px-4 py-[7px]'>
          <Identicon name={walletId} className='h-5 w-5 rounded' />
          <p className='font-bold text-muted-foreground'>2t1m...2x95f</p>
        </div>
      )}
    </>
  );
}
