import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { Button } from '@penumbra-zone/ui/components/ui/button';
import { TrashGradientIcon } from '../../../icons/trash-gradient';
import { ServicesMessage } from '../../../message/services';
import { usePopupNav } from '../../../utils/navigate';
import { PopupPath } from '../paths';
import { useStore } from '../../../state';
import { useState } from 'react';
import { SettingsScreen } from './settings-screen';

const useCacheClear = () => {
  const navigate = usePopupNav();
  const [loading, setLoading] = useState(false);

  const handleCacheClear = () => {
    setLoading(true);

    void (async function () {
      await chrome.runtime.sendMessage(ServicesMessage.ClearCache);
      useStore.setState(state => {
        state.network.fullSyncHeight = undefined;
      });
      navigate(PopupPath.INDEX);
    })();
  };

  return { handleCacheClear, loading };
};

export const SettingsClearCache = () => {
  const { handleCacheClear, loading } = useCacheClear();

  return (
    <SettingsScreen title='Clear cache' IconComponent={TrashGradientIcon}>
      <div className='flex flex-1 flex-col items-start justify-between px-[30px] pb-5'>
        <div className='flex flex-col items-center gap-2'>
          <p className='font-headline text-base font-semibold'>Are you sure?</p>
          <p className='text-center text-muted-foreground'>
            Do you really want to clear cache? All local data will be deleted and resynchronized.
          </p>
          <p className='mt-2 flex items-center gap-2 font-headline text-base font-semibold text-rust'>
            <ExclamationTriangleIcon className='size-[30px] text-rust' /> You private keys won’t be
            lost!
          </p>
        </div>
        <Button
          disabled={loading}
          variant='gradient'
          size='lg'
          className='w-full'
          onClick={handleCacheClear}
        >
          {loading ? 'Clearing cache...' : 'Confirm'}
        </Button>
      </div>
    </SettingsScreen>
  );
};
