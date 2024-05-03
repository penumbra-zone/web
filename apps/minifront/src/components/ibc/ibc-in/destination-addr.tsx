import { useStore } from '../../../state';
import { ibcInSelector } from '../../../state/ibc-in';
import { useEffect } from 'react';
import { IncognitoIcon } from '@penumbra-zone/ui/components/ui/icons/incognito';

export const DestinationAddr = () => {
  const { penumbraAddrs, fetchPenumbraAddrs } = useStore(ibcInSelector);

  // TODO: allow for user account selection
  // On mount, get normal+ephemeral address for Account #0
  // List disable reason: Do not want to re-render ephemeral address every-render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => void fetchPenumbraAddrs(), []);

  return (
    <div className='flex flex-col gap-1 break-all text-stone-700'>
      <div className='font-bold'>
        Sending to your <span className='text-teal-600'>Account #0</span>
      </div>
      {penumbraAddrs && (
        <>
          <div>Here is your normal address</div>
          <div className='rounded-xl bg-teal-200 p-2 text-teal-600'>{penumbraAddrs.normal}</div>
          <div>
            But you will IBC to an ephemeral address representing{' '}
            <span className='font-bold text-amber-600'>Account #0</span> to maintain privacy{' '}
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
