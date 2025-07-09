import Link from 'next/link';
import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Ban, Coins, Check, Wallet2, ExternalLink, List } from 'lucide-react';
import { getMetadata as getMetadataFromValueView } from '@penumbra-zone/getters/value-view';
import { Skeleton } from '@penumbra-zone/ui/Skeleton';
import { Button } from '@penumbra-zone/ui/Button';
import { Text } from '@penumbra-zone/ui/Text';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { ConnectButton } from '@/features/connect/connect-button';
import { PagePath } from '@/shared/const/pages';
import { VoteDialogueSelector } from './vote-dialog';
import { useVotingInfo } from '../api/use-voting-info';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

const STAKING_LINK = 'https://app.penumbra.zone/#/staking';

export interface VotingInfoProps {
  epoch?: number;
  identifier: string;
}

export const VotedFor = ({ votedFor }: { votedFor: ValueView }) => {
  return (
    <div className='flex items-center gap-4'>
      <div className='size-10 text-success-light'>
        <Check className='h-full w-full' />
      </div>
      <Text variant='small' color='text.secondary'>
        You have already voted in this epoch. Come back next epoch to vote again.
      </Text>
      <ValueViewComponent showValue={false} valueView={votedFor} />
    </div>
  );
};

export const VotingInfo = observer(({ epoch, identifier }: VotingInfoProps) => {
  const votingInfo = useVotingInfo(epoch);

  const isRoundPage = identifier == 'round-card';
  const epochLink = epoch ? PagePath.TournamentRound.replace(':epoch', epoch.toString()) : '';

  const [isVoteDialogueOpen, setIsVoteDialogOpen] = useState(false);

  const openVoteDialog = () => {
    setIsVoteDialogOpen(true);
  };

  const closeVoteDialog = () => {
    setIsVoteDialogOpen(false);
  };

  if (votingInfo.case === 'loading') {
    return (
      <div className='flex flex-col gap-8'>
        <div className='h-8 w-24'>
          <Skeleton />
        </div>
        <div className='h-12 w-full overflow-hidden rounded-sm'>
          <Skeleton />
        </div>
      </div>
    );
  }

  if (votingInfo.case === 'not-connected') {
    return (
      <div className='flex flex-col gap-8'>
        <div className='flex items-center gap-4'>
          <div className='size-8 text-text-secondary'>
            <Wallet2 className='h-full w-full' />
          </div>
          <Text variant='small' color='text.secondary'>
            Connect Prax Wallet to vote in this epoch and see your rewards from participating.
          </Text>
        </div>
        <div className='flex gap-2'>
          <div className='grow'>
            <ConnectButton actionType='accent' variant='default' />
          </div>
          <div className='grow'>
            {!isRoundPage && (
              <div className='flex-1'>
                <Link href={epochLink}>
                  <Button actionType='default'>Details</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isRoundPage && votingInfo.case === 'ended') {
    const currentEpoch = votingInfo.currentEpoch;
    const currentEpochLink = currentEpoch
      ? PagePath.TournamentRound.replace(':epoch', currentEpoch.toString())
      : PagePath.Tournament;
    return (
      <div className='flex flex-col gap-8'>
        <div className='flex items-center gap-4'>
          {votingInfo.votedFor ? (
            <VotedFor votedFor={votingInfo.votedFor} />
          ) : (
            <div className='flex items-center gap-4'>
              <div className='size-8 text-neutral-light'>
                <List className='h-full w-full' />
              </div>
              <Text small color='text.secondary'>
                You haven&#39;t voted in this epoch.
              </Text>
            </div>
          )}
        </div>
        <div className='flex gap-2'>
          <div className='grow'>
            <Link href={currentEpochLink}>
              <Button actionType='default'>
                Go To Current Epoch {currentEpoch && '#'}
                {currentEpoch}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (votingInfo.case === 'already-voted') {
    const votedFor = votingInfo.votedFor;
    const metadata = getMetadataFromValueView.optional(votedFor);
    const tradeLink = metadata
      ? PagePath.TradePair.replace(
          ':primary',
          metadata.symbol === 'USDC' ? 'UM' : metadata.symbol,
        ).replace(':numeraire', 'USDC')
      : PagePath.Trade;
    return (
      <div className='flex flex-col gap-8'>
        <VotedFor votedFor={votingInfo.votedFor} />
        {!isRoundPage && (
          <div className='flex gap-2'>
            <div className='grow'>
              <Link href={epochLink}>
                <Button actionType='default'>Details</Button>
              </Link>
            </div>
            <div className='grow'>
              <Link href={tradeLink}>
                <Button actionType='default' priority='secondary'>
                  Trade
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (votingInfo.case === 'can-vote') {
    return (
      <>
        <div className='flex flex-col gap-8'>
          <div className='flex items-center gap-4'>
            <div className='size-10 text-text-secondary'>
              <Coins className='h-full w-full' />
            </div>
            <Text variant='small' color='text.secondary'>
              You&#39;ve delegated UM and can now vote with your delUM in this epoch.
            </Text>
            <ValueViewComponent valueView={votingInfo.power} />
          </div>
          <div className='flex w-full gap-2'>
            {!isRoundPage ? (
              <div className='max-w-[300px] flex-1'>
                <Button actionType='accent' onClick={openVoteDialog}>
                  Vote Now
                </Button>
              </div>
            ) : (
              <Button actionType='accent' onClick={openVoteDialog}>
                Vote Now
              </Button>
            )}
            <div className='flex-1'>
              {!isRoundPage && (
                <div className='flex-1'>
                  <Link href={epochLink}>
                    <Button actionType='default'>Details</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <VoteDialogueSelector
          ability={votingInfo.ability}
          isOpen={isVoteDialogueOpen}
          onClose={closeVoteDialog}
        />
      </>
    );
  }

  if (votingInfo.case === 'delegated-after-start') {
    return (
      <div className='flex flex-col gap-8'>
        <div className='flex items-center gap-4'>
          <div className='size-14 text-destructive-light'>
            <Ban className='h-full w-full' />
          </div>
          <Text variant='small' color='text.secondary'>
            You can&#39;t vote in this epoch because you delegated your UM after the epoch started.
            You&#39;ll be able to vote next epoch.
          </Text>
        </div>
        <div className='flex gap-2'>
          <div className='flex-1'>
            {!isRoundPage ? (
              <div className='max-w-[300px] flex-1'>
                <Button actionType='accent' disabled>
                  Vote Now
                </Button>
              </div>
            ) : (
              <Button actionType='accent' disabled>
                Vote Now
              </Button>
            )}
          </div>
          <div className='flex-1'>
            {!isRoundPage && (
              <div className='flex-1'>
                <Link href={epochLink}>
                  <Button actionType='default'>Details</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-8'>
      <div className='flex items-center gap-4'>
        <div className='size-10 text-text-secondary'>
          <Coins className='h-full w-full' />
        </div>
        <Text variant='small' color='text.secondary'>
          Delegate UM to vote and influence how incentives are distributed in this epoch.
        </Text>
      </div>
      <div className='flex gap-2'>
        <div className='flex-1'>
          <a href={STAKING_LINK} target='_blank' rel='noreferrer'>
            {!isRoundPage ? (
              <div className='max-w-[300px] flex-1'>
                <Button actionType='accent' icon={ExternalLink}>
                  Delegate
                </Button>
              </div>
            ) : (
              <Button actionType='accent' icon={ExternalLink}>
                Delegate
              </Button>
            )}
          </a>
        </div>
        {!isRoundPage && (
          <div className='flex-1'>
            <Link href={epochLink}>
              <Button actionType='default'>Details</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
});
