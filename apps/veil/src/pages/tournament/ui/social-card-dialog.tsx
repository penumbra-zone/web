import { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Dialog } from '@penumbra-zone/ui/Dialog';
import { Icon } from '@penumbra-zone/ui/Icon';
import { Checkbox } from '@penumbra-zone/ui/Checkbox';
import { Button } from '@penumbra-zone/ui/Button';
import { Copy } from 'lucide-react';
import Xcom from '@/shared/assets/x.com.svg';
import { drawTournamentEarningsCanvas } from './shared/tournament-earnings-canvas';

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

/**
 * - One time per epoch modal
 * - If you got a reward, this social card is displayed which can be shared on X
 *
 * 1. When would this happen
 *    - This would happen specifically the first time that someone opens Veil if
 *      - having voted in a recent delegation event
 *      - and has not dismissed the social card modal
 *    - It should be triggered by the delegator address receiving a rewards distribution,
 *      - and is dismissable each epoch unless the delegator does not vote in the current
 *        epoch (this will be evident by whether or not their receive a rewards distribution).
 */
const keyMap = {
  tournamentEpoch: 't',
  earnings: 'e',
  votingStreak: 'v',
  incentivePool: 'i',
  lpPool: 'l',
  delegatorPool: 'd',
};

function encodeParams(obj: Record<string, string>) {
  return Object.entries(obj)
    .map(([key, value]) => `${keyMap[key as keyof typeof keyMap]}=${value}`)
    .join('&');
}

export const SocialCardDialog = observer(
  ({ isOpen: isOpenProp, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [dontShowAgain, setDontShowAgain] = useState(false);
    const [isOpen, setIsOpen] = useState(isOpenProp);

    // eslint-disable-next-line react-hooks/exhaustive-deps -- should be static
    const params = {
      epoch: '135',
      earnings: '17280:UM',
      votingStreak: '80000:UM',
      incentivePool: '100000:UM',
      lpPool: '100000:UM',
      delegatorPool: '100000:UM',
    };

    const text = 'Check out my latest win!';
    const url = `https://dex.penumbra.zone/tournament/join?${encodeParams(params)}`;

    useEffect(() => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        void drawTournamentEarningsCanvas(canvas, params);
      }
    }, [canvasRef, isOpen, params]);

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
              <Button
                actionType='default'
                onClick={() => void copyImageToClipboard(canvasRef.current?.toDataURL() ?? '')}
              >
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
            <canvas
              ref={canvasRef}
              className='w-[512px] h-[512px] bg-other-tonalFill10'
              width={512}
              height={512}
            />
          </div>
        </Dialog.Content>
      </Dialog>
    );
  },
);
