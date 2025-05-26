import { useCallback, useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { getDisplayDenomExponent } from '@penumbra-zone/getters/metadata';
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
import { useCurrentEpoch } from '../api/use-current-epoch';
import { usePersonalRewards } from '../api/use-personal-rewards';
import { connectionStore } from '@/shared/model/connection';
import { useTournamentSummary } from '../api/use-tournament-summary';
import { useStakingTokenMetadata } from '@/shared/api/registry';
import { useSpecificDelegatorSummary } from '../api/use-specific-delegator-summary';

export const dismissedKey = 'veil-tournament-social-card-dismissed';
const baseUrl = process.env['NEXT_PUBLIC_BASE_URL'] ?? 'http://localhost:3000';

// Custom hook that consolidates all location storage operations.
export function useTournamentSocialCard(defaultEpoch: number | undefined) {
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

const SocialCardCanvas = ({ params }: { params?: TournamentParams }) => {
  const { data: stakingToken } = useStakingTokenMetadata();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hasDrawn = useRef(false);

  useEffect(() => {
    if (!params || hasDrawn.current) {
      return;
    }

    const canvas = canvasRef.current;
    const exponent = getDisplayDenomExponent.optional(stakingToken);

    // Check canvas requirments before rendering
    if (!canvas || exponent === undefined) {
      return;
    }

    if (exponent) {
      void renderTournamentEarningsCanvas(canvas, params, exponent, {
        width: 512,
        height: 512,
      });
      hasDrawn.current = true;
    }

    return () => {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
  }, [params, stakingToken]);

  return (
    <canvas
      ref={canvasRef}
      className='w-full h-auto max-w-[512px] aspect-square bg-other-tonalFill10'
    />
  );
};

/**
 * Displays a shareable social card once per epoch if:
 * - The user voted in the previous delegation event
 * - A reward was received
 * - The modal hasn’t been dismissed for this epoch
 *
 * Shown only on first Veil open per epoch.
 */
export const SocialCardDialog = observer(
  ({ onClose, epoch }: { epoch: number; onClose: () => void }) => {
    const { subaccount } = connectionStore;
    const [initialParams, setInitialParams] = useState<TournamentParams | undefined>(undefined);

    const { data: summary, isLoading: loadingSummary } = useTournamentSummary({
      limit: 1,
      page: 1,
    });

    const {
      data: rewards,
      query: { isLoading: loadingRewards },
    } = usePersonalRewards(subaccount, epoch, false, 1, 1);

    const { data: delegatorSummary, isLoading: loadingDelegatorSummary } =
      useSpecificDelegatorSummary(subaccount);

    const summaryData = summary?.[0];
    const rewardData = rewards.get(epoch);

    const loading = loadingSummary || loadingRewards || loadingDelegatorSummary;

    useEffect(() => {
      if (loading || initialParams || !summaryData || !rewardData || !delegatorSummary?.data) {
        return;
      }

      setInitialParams({
        epoch: String(epoch),
        rewarded: rewardData.reward > 0,
        earnings: `${rewardData.reward}:UM`,
        votingStreak: `${delegatorSummary.data.streak * 1e6}:`,
        incentivePool: `${Math.ceil(Number(summaryData.lp_rewards) + Number(summaryData.delegator_rewards))}:UM`,
        lpPool: `${Math.ceil(summaryData.lp_rewards)}:UM`,
        delegatorPool: `${Math.ceil(summaryData.delegator_rewards)}:UM`,
      });
    }, [loading, summaryData, rewardData, delegatorSummary?.data, initialParams, epoch]);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [dontShowAgain, setDontShowAgain] = useState(false);

    const text = `🚨 Penumbra's Liquidity Tournament is LIVE! 🚨

    💧 Provide liquidity  
    📈 Climb the leaderboard  
    🏆 Win rewards

    👇 Join now:`;

    const url = initialParams ? `${baseUrl}/tournament/join?${encodeParams(initialParams)}` : '';

    if (!initialParams?.rewarded) {
      return null;
    }

    // TODO: fix rendering. merging main included dialogue component
    // changes that broke the rendering.
    return (
      <Dialog isOpen onClose={onClose}>
        <Dialog.Content
          title='Share your latest win!'
          aria-describedby='tournament-social-description'
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
          <div id='tournament-social-description'>
            <div className='flex justify-center overflow-x-hidden'>
              <SocialCardCanvas params={initialParams} />
            </div>
          </div>
        </Dialog.Content>
      </Dialog>
    );
  },
);
