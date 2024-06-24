import { AllSlices } from '../../../state';
import { useStoreShallow } from '../../../utils/use-store-shallow';
import { AccountSwitcher } from '@repo/ui/components/ui/account-switcher';

const addrsSelector = ({ ibcIn }: AllSlices) => ({
  account: ibcIn.account,
  setAccount: ibcIn.setAccount,
});

export const DestinationAddr = () => {
  const { account, setAccount } = useStoreShallow(addrsSelector);

  return (
    <div className='flex w-full flex-col gap-1 break-all text-stone-700'>
      <div className='flex items-center justify-between'>
        <p className='font-bold'>Sending to</p>
        <AccountSwitcher compact account={account} onChange={setAccount} />
      </div>
    </div>
  );
};
