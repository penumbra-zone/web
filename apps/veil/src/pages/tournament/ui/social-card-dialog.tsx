import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Dialog } from '@penumbra-zone/ui/Dialog';
import { Icon } from '@penumbra-zone/ui/Icon';
import { Skeleton } from '@penumbra-zone/ui/Skeleton';
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
import { useCurrentEpoch } from '../api/use-current-epoch';
import { usePersonalRewards } from '../api/use-personal-rewards';
import { connectionStore } from '@/shared/model/connection';
import { useTournamentSummary } from '../api/use-tournament-summary';
import { LqtDelegatorHistoryData } from '../server/delegator-history';
import cn from 'clsx';

export const dismissedKey = 'veil-tournament-social-card-dismissed';
const baseUrl = process.env['NEXT_PUBLIC_BASE_URL'] ?? 'http://localhost:3000';

// Custom hook that consolidates all location storage operations.
export function useTournamentSocialCard(defaultEpoch?: number) {
  const [isOpen, setIsOpen] = useState(false);

  const { epoch: currentEpoch } = useCurrentEpoch();
  const epoch = defaultEpoch ?? currentEpoch;
  const ended = !!currentEpoch && !!epoch && epoch !== currentEpoch;

  useEffect(() => {
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

// TODO: fix flickering image.
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

// TODO: fix the x link url.
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

export const SocialCardDialog = observer(
  ({ onClose, epoch }: { epoch: number; onClose: () => void }) => {
    const { subaccount } = connectionStore;

    const { data: summary, isLoading: loadingSummary } = useTournamentSummary({
      limit: 1,
      page: 1,
    });
    const {
      data: rewards,
      query: { isLoading: loadingRewards },
    } = usePersonalRewards(subaccount, epoch, false, 1, 1);
    const loading = loadingSummary || loadingRewards;

    const params: TournamentParams | undefined = useMemo(() => {
      if (loadingSummary || loadingRewards) {
        return undefined;
      }

      const summaryData = summary?.[0];
      const rewardData = rewards.values().next().value as LqtDelegatorHistoryData | undefined;

      if (!summaryData || !rewardData) {
        return undefined;
      }

      // TODO: add query for voting streak.
      return {
        epoch: String(epoch),
        earnings: `${rewardData.reward}:UM`,
        votingStreak: `${rewardData.power}:UM`,
        incentivePool: `${summaryData.lp_rewards + summaryData.delegator_rewards}:UM`,
        lpPool: `${summaryData.lp_rewards}:UM`,
        delegatorPool: `${summaryData.delegator_rewards}:UM`,
      };
    }, [epoch, summary, rewards, loadingSummary, loadingRewards]);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [dontShowAgain, setDontShowAgain] = useState(false);

    const text = `🚨 Penumbra's Liquidity Tournament is LIVE 🚨
    Provide liquidity. Climb the leaderboard. Win rewards.
    Join now 👇`;
    const url = params ? `https://${baseUrl}/tournament/join?${encodeParams(params)}` : '';

    useEffect(() => {
      if (!params) {
        return;
      }

      const canvas = canvasRef.current;
      if (canvas) {
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
    }, [params]);

    return (
      <Dialog isOpen onClose={onClose}>
        <Dialog.Content
          title='Share your latest win!'
          buttons={
            <div className='flex flex-col gap-4 px-6 pb-8'>
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
            {loading && (
              <div className='size-[512px]'>
                <Skeleton />
              </div>
            )}
            <canvas
              ref={canvasRef}
              className={cn('size-[512px] max-w-full bg-other-tonalFill10', loading && 'hidden')}
              width={512}
              height={512}
            />
          </div>
        </Dialog.Content>
      </Dialog>
    );
  },
);
