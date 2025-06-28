import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
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
import { usePersonalRewards } from '../api/use-personal-rewards';
import { connectionStore } from '@/shared/model/connection';
import { useTournamentSummary } from '../api/use-tournament-summary';
import { useStakingTokenMetadata } from '@/shared/api/registry';
import { useSpecificDelegatorSummary } from '../api/use-specific-delegator-summary';
import { useCurrentEpoch } from '../api/use-current-epoch';
import { LqtDelegatorHistoryData } from '../server/delegator-history';
import { formatTimeRemaining } from '@/shared/utils/format-time';

export const dismissedKey = 'veil-tournament-social-card-dismissed';
const baseUrl = process.env['NEXT_PUBLIC_BASE_URL'] ?? 'http://localhost:3000';

// Custom hook that consolidates all location storage operations.
export function useTournamentSocialCard(epoch: number | undefined) {
  const [isOpen, setIsOpen] = useState(false);
  const { epoch: currentEpoch } = useCurrentEpoch();

  useEffect(() => {
    if (!epoch || !currentEpoch) {
      return;
    }

    const highestSeen = Number(localStorage.getItem(dismissedKey) ?? 0);

    if (epoch > highestSeen) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [epoch, currentEpoch]);

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

const SocialCardCanvas = ({
  params,
  canvasRef,
}: {
  params?: TournamentParams;
  canvasRef: RefObject<HTMLCanvasElement | null>;
}) => {
  const { data: stakingToken } = useStakingTokenMetadata();
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
  }, [params, stakingToken, canvasRef]);

  return (
    <canvas
      ref={canvasRef}
      className='aspect-square h-auto w-full max-w-[512px] bg-other-tonal-fill10'
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
  ({ onClose, epoch }: { epoch: number | undefined; onClose: () => void }) => {
    // Return early if epoch is undefined.
    if (!epoch) {
      return null;
    }

    const { subaccount } = connectionStore;
    const [initialParams, setInitialParams] = useState<TournamentParams | undefined>(undefined);

    const { data: stakingToken, isLoading: stakingTokenLoading } = useStakingTokenMetadata();
    const exponent = getDisplayDenomExponent.optional(stakingToken);

    if (exponent === undefined) {
      return;
    }

    const { data: summary, isLoading: loadingSummary } = useTournamentSummary({
      limit: 1,
      page: 1,
      epochs: [epoch],
    });

    const { data: currentEpochSummary } = useTournamentSummary({
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
    const latestReward = rewards.values().next().value as LqtDelegatorHistoryData | undefined;

    const loading =
      loadingSummary || loadingRewards || loadingDelegatorSummary || stakingTokenLoading;

    useEffect(() => {
      if (loading || (initialParams ?? !summaryData) || !latestReward || !delegatorSummary?.data) {
        return;
      }

      setInitialParams({
        epoch: String(epoch),
        rewarded: latestReward.reward > 0,
        earnings: `${Math.floor(latestReward.reward) / 10 ** exponent}:UM`,
        votingStreak: `${delegatorSummary.data.streak}:`,
        incentivePool: `${Math.floor(Number(summaryData.lp_rewards) + Number(summaryData.delegator_rewards)) / 10 ** exponent}:UM`,
        lpPool: `${Math.floor(summaryData.lp_rewards) / 10 ** exponent}:UM`,
        delegatorPool: `${Math.floor(summaryData.delegator_rewards) / 10 ** exponent}:UM`,
      });
    }, [
      loading,
      summaryData,
      latestReward,
      delegatorSummary?.data,
      initialParams,
      epoch,
      exponent,
    ]);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [dontShowAgain, setDontShowAgain] = useState(false);

    const text = `Just won ${latestReward?.reward} UM from the @penumbrazone Liquidity Tournament
Delegated UM. Voted. Earned. All without giving up privacy.
${currentEpochSummary?.[0]?.ends_in_s ? `Next round starts in ${formatTimeRemaining(currentEpochSummary[0].ends_in_s)}` : ''}`;

    const url = initialParams ? `${baseUrl}/tournament/join?${encodeParams(initialParams)}` : '';

    if (!initialParams?.rewarded) {
      return null;
    }

    return (
      <Dialog isOpen onClose={onClose}>
        <Dialog.Content
          title='Share your latest win!'
          aria-describedby='tournament-social-description'
          buttons={
            <div className='mx-auto flex w-full max-w-[475px] flex-col gap-1'>
              <Button
                actionType='default'
                onClick={() => void copyImageToClipboard(canvasRef.current?.toDataURL() ?? '')}
              >
                <Icon IconComponent={Copy} size='sm' />
                Copy Image
              </Button>
              <Button actionType='accent' onClick={() => shareToX(text, url)}>
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
          <div id='tournament-social-description' className='flex justify-center'>
            <SocialCardCanvas canvasRef={canvasRef} params={initialParams} />
          </div>
        </Dialog.Content>
      </Dialog>
    );
  },
);
