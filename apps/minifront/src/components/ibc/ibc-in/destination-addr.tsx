import { AllSlices } from '../../../state';
import { useStoreShallow } from '../../../utils/use-store-shallow';
import { AccountSwitcher } from '@repo/ui/components/ui/account-switcher';
import { CopyToClipboard } from '@repo/ui/components/ui/copy-to-clipboard';
import { useEffect } from 'react';

const addrsSelector = ({ ibcIn }: AllSlices) => ({
  account: ibcIn.account,
  address: ibcIn.address,
  setAccount: ibcIn.setAccount,
});

export const DestinationAddr = () => {
  const { account, setAccount, address } = useStoreShallow(addrsSelector);

  // Set initial account to trigger address loading
  useEffect(() => {
    setAccount(0);
  }, [setAccount]);

  return (
    <div className='mb-2 flex w-full flex-col gap-1 text-stone-700'>
      <div className='flex items-center justify-between'>
        <p className='font-bold'>Sending to</p>
        <AccountSwitcher compact account={account} onChange={setAccount} />
      </div>

      {address && (
        <div className='text-sm text-stone-700 [&>button]:inline-block [&>button]:p-0'>
          The deposit will be made to a freshly generated address belonging to you. You can inspect
          what account it points to inside of Prax.{' '}
          <CopyToClipboard
            text={address}
            successLabel={<span className='text-sm'>Copied</span>}
            label={<span className='text-sm text-stone-700 underline'>Copy address</span>}
          />
        </div>
      )}
    </div>
  );
};
