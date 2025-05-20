import { useCallback, useEffect, useRef, useState } from 'react';
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
import { useParams } from 'next/navigation';
import { useCurrentEpoch } from '../api/use-current-epoch';
import { usePersonalRewards } from '../api/use-personal-rewards';
import { connectionStore } from '@/shared/model/connection';

export const dismissedKey = 'veil-tournament-social-card-dismissed';
const baseUrl = process.env['NEXT_PUBLIC_BASE_URL'] ?? 'http://localhost:3000';

// Custom hook that consolidates all location storage operations.
export function useTournamentSocialCard() {
  const [isOpen, setIsOpen] = useState(false);
  const params = useParams<{ epoch: string }>();
  const epoch = Number(params?.epoch);

  const { epoch: currentEpoch, isLoading: _epochLoading } = useCurrentEpoch();

  const ended = !!currentEpoch && !!epoch && epoch !== currentEpoch;

  // TODO: need to add personal rewards to social dialogue card
  const { subaccount } = connectionStore;
  const { data: _rewards } = usePersonalRewards(subaccount, epoch, false, 1, 1);

  useEffect(() => {
    // q. should this check remain here?
    if (!ended) {
      setIsOpen(false);
      return;
    }

    const highestSeen = Number(localStorage.getItem(dismissedKey) ?? 0);

    if (epoch > highestSeen) {
      setIsOpen(true);
    }
  }, [epoch, ended]);

  const close = useCallback(() => {
    localStorage.setItem(dismissedKey, String(epoch));
    setIsOpen(false);
  }, [epoch]);

  return { isOpen, close };
}

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
    isOpen: isOpen,
    onClose,
    params = dummyParams,
  }: {
    isOpen: boolean;
    onClose: () => void;
    params: TournamentParams;
  }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [dontShowAgain, setDontShowAgain] = useState(false);

    const text = `🚨 Penumbra's Liquidity Tournament is LIVE 🚨
    Provide liquidity. Climb the leaderboard. Win rewards.
    Join now 👇`;

    const url = `https://${baseUrl}/tournament/join?${encodeParams(params)}`;

    useEffect(() => {
      if (!isOpen) {
        return;
      }

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
    }, [isOpen, params]);

    const handleClose = () => {
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
              <div className='flex justify-center overflow-x-hidden'>
                <canvas
                  ref={canvasRef}
                  className='w-[512px] h-[512px] bg-other-tonalFill10'
                  width={512}
                  height={512}
                />
              </div>
            </Dialog.Content>
          </div>
        </Dialog>
      </div>
    );
  },
);
