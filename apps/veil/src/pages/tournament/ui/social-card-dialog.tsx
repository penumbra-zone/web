import { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Dialog } from '@penumbra-zone/ui/Dialog';
import { Icon } from '@penumbra-zone/ui/Icon';
import { Checkbox } from '@penumbra-zone/ui/Checkbox';
import { Button } from '@penumbra-zone/ui/Button';
import { Copy } from 'lucide-react';
import Xcom from '@/shared/assets/x.com.svg';
import {
  TournamentParams,
  renderTournamentEarningsCanvas,
  encodeParams,
} from '@/features/tournament-earnings-canvas';
import { openToast } from '@penumbra-zone/ui/Toast';

export const dismissedKey = 'veil-tournament-social-card-dismissed';

const baseUrl = process.env['NEXT_PUBLIC_BASE_URL'] ?? 'http://localhost:3000';

async function copyImageToClipboard(imageUrl: string) {
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  const clipboardItem = new ClipboardItem({ [blob.type]: blob });
  await navigator.clipboard.write([clipboardItem]);

  openToast({
    type: 'success',
    message: 'Image copied to clipboard!',
  });
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
const dummyParams: TournamentParams = {
  epoch: '135',
  earnings: '17280:UM',
  votingStreak: '80000:UM',
  incentivePool: '100000:UM',
  lpPool: '100000:UM',
  delegatorPool: '100000:UM',
};

export const SocialCardDialog = observer(
  ({
    isOpen: isOpenProp,
    onClose,
    params = dummyParams,
  }: {
    isOpen: boolean;
    onClose: () => void;
    params: TournamentParams;
  }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [dontShowAgain, setDontShowAgain] = useState(false);
    const [isOpen, setIsOpen] = useState(isOpenProp);

    const text = `🚨 Penumbra's Liquidity Tournament is LIVE 🚨

Provide liquidity. Climb the leaderboard. Win rewards.

Join now 👇`;
    const url = `https://${baseUrl}/tournament/join?${encodeParams(params)}`;

    useEffect(() => {
      const canvas = canvasRef.current;
      if (canvas && isOpen) {
        void renderTournamentEarningsCanvas(canvas, params, {
          width: 512,
          height: 512,
        });
      }

      return () => {
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
        }
      };
    }, [canvasRef, isOpen, params]);

    useEffect(() => {
      if (dontShowAgain) {
        const dismissed = localStorage.getItem(dismissedKey);
        if (dismissed) {
          localStorage.setItem(
            dismissedKey,
            JSON.stringify([...(JSON.parse(dismissed) as string[]), params.epoch]),
          );
        } else {
          localStorage.setItem(dismissedKey, JSON.stringify([params.epoch]));
        }
      }
    }, [dontShowAgain, params.epoch]);

    useEffect(() => {
      if (isOpenProp) {
        const dismissed = localStorage.getItem(dismissedKey);
        if (!dismissed || !(JSON.parse(dismissed) as string[]).includes(params.epoch)) {
          setIsOpen(true);
        }
      }
    }, [isOpenProp, params.epoch]);

    if (!isOpen) {
      return null;
    }

    const handleClose = () => {
      setIsOpen(false);
      onClose();
    };

    return (
      <div className='max-w-[212px]'>
        <Dialog isOpen={isOpen} onClose={handleClose}>
          <div className='max-w-[212px]'>
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
              <canvas
                ref={canvasRef}
                className='w-[512px] h-[512px] bg-other-tonalFill10'
                width={512}
                height={512}
              />
            </Dialog.Content>
          </div>
        </Dialog>
      </div>
    );
  },
);
