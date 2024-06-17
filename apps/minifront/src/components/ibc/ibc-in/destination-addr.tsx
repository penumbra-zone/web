import { AllSlices } from '../../../state';
import { useEffect } from 'react';
import { IncognitoIcon } from '@penumbra-zone/ui/components/ui/icons/incognito';
import { useStoreShallow } from '../../../utils/use-store-shallow';
import { AccountSwitcher } from '@penumbra-zone/ui/components/ui/account-switcher';

const addrsSelector = ({ ibcIn }: AllSlices) => ({
  fetchPenumbraAddrs: ibcIn.fetchPenumbraAddrs,
  penumbraAddrs: ibcIn.penumbraAddrs,
  selectedChain: ibcIn.selectedChain,
  account: ibcIn.account,
  setAccount: ibcIn.setAccount,
});

export const DestinationAddr = () => {
  const { penumbraAddrs, fetchPenumbraAddrs, selectedChain, account, setAccount } =
    useStoreShallow(addrsSelector);

  // On mount and account change, get normal+ephemeral address for selected account
  useEffect(() => void fetchPenumbraAddrs(), [fetchPenumbraAddrs, selectedChain, account]);

  return (
    <div className='flex flex-col gap-1 break-all text-stone-700'>
      <div className='flex items-center justify-between'>
        <p className='font-bold'>Sending to</p>
        <AccountSwitcher compact account={account} onChange={setAccount} />
      </div>

      {penumbraAddrs && (
        <>
          <div>Here is your normal address</div>
          <div className='rounded-xl bg-teal-200 p-2 text-teal-600'>{penumbraAddrs.normal}</div>
          <div>
            But you will IBC to an ephemeral address representing{' '}
            <span className='font-bold text-amber-600'>Account #{account}</span> to maintain privacy{' '}
            <span className='-mb-1 inline-block'>
              <IncognitoIcon fill='#d97706' />
            </span>
          </div>
          <div className='rounded-xl bg-amber-200 p-2 text-amber-600'>
            {penumbraAddrs.ephemeral}
          </div>
        </>
      )}
    </div>
  );
};
