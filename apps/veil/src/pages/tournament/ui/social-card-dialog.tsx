import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Dialog } from '@penumbra-zone/ui/Dialog';
import { Icon } from '@penumbra-zone/ui/Icon';
import { Checkbox } from '@penumbra-zone/ui/Checkbox';
import { Button } from '@penumbra-zone/ui/Button';
import { Copy } from 'lucide-react';
import Xcom from '@/shared/assets/x.com.svg';

export const dismissedKey = 'veil-tournament-social-card-dismissed';

async function copyImageToClipboard(imageUrl: string) {
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  const clipboardItem = new ClipboardItem({ [blob.type]: blob });
  await navigator.clipboard.write([clipboardItem]);

  alert('Image copied to clipboard!');
}

function shareToX(text: string, url: string) {
  const tweetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  window.open(tweetUrl, '_blank');
}

export const SocialCardDialog = observer(
  ({ isOpen: isOpenProp, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const [dontShowAgain, setDontShowAgain] = useState(false);
    const [isOpen, setIsOpen] = useState(isOpenProp);

    const imgUrl =
      'https://cdn.prod.website-files.com/6716465e69621e20266e5713/67b37db21981aa1de497c19b_stride_blog.png';

    const text = 'Check out my latest win!';
    const url = 'https://dex-explorer.mainnet.plinfra.net/tournament';

    useEffect(() => {
      if (dontShowAgain) {
        localStorage.setItem(dismissedKey, 'true');
      }
    }, [dontShowAgain]);

    useEffect(() => {
      if (isOpenProp) {
        const dismissed = localStorage.getItem(dismissedKey);
        if (dismissed !== 'true') {
          setIsOpen(true);
        }
      }
    }, [isOpenProp]);

    if (!isOpen) {
      return null;
    }

    return (
      <Dialog isOpen={isOpen} onClose={onClose}>
        <Dialog.Content
          title='Share your latest win!'
          buttons={
            <div className='flex flex-col gap-4'>
              <Button actionType='default' onClick={() => void copyImageToClipboard(imgUrl)}>
                <Icon IconComponent={Copy} size='sm' />
                Copy Image
              </Button>
              <Button actionType='accent' onClick={() => shareToX(text, url)}>
                {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Xcom */}
                <Icon IconComponent={Xcom} size='sm' />
                Share
              </Button>
              <div className='flex justify-center p-2'>
                <Checkbox
                  checked={dontShowAgain}
                  onChange={() => setDontShowAgain(!dontShowAgain)}
                  title="Don't show this again"
                />
              </div>
            </div>
          }
        >
          <div className='flex justify-center overflow-y-scroll'>
            {/* eslint-disable-next-line @next/next/no-img-element -- external url */}
            <img
              alt='Share your latest win!'
              src={imgUrl}
              className='w-[512px] h-[512px] bg-other-tonalFill10'
            />
          </div>
        </Dialog.Content>
      </Dialog>
    );
  },
);
