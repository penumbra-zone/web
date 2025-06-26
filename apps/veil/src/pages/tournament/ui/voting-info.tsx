import Link from 'next/link';
import { useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Ban, Coins, Check, Wallet2, ExternalLink, List } from 'lucide-react';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { Amount } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';
import { addAmounts } from '@penumbra-zone/types/amount';
import { getMetadata as getMetadataFromValueView } from '@penumbra-zone/getters/value-view';
import { Skeleton } from '@penumbra-zone/ui/Skeleton';
import { Button } from '@penumbra-zone/ui/Button';
import { Text } from '@penumbra-zone/ui/Text';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { ConnectButton } from '@/features/connect/connect-button';
import { connectionStore } from '@/shared/model/connection';
import { useGetMetadata } from '@/shared/api/assets';
import { PagePath } from '@/shared/const/pages';
import { useLQTNotes } from '../api/use-voting-notes';
import { useCurrentEpoch } from '../api/use-current-epoch';
import { useTournamentVotes } from '../api/use-tournament-votes';
import { VoteDialogueSelector } from './vote-dialog';
import { useAccountDelegations } from '../api/use-delegations';
import { useStakingTokenMetadata } from '@/shared/api/registry';

export const useVotingInfo = (defaultEpoch?: number) => {
  const { connected, subaccount } = connectionStore;
  const getMetadata = useGetMetadata();

  const {
    epoch: currentEpoch,
    isLoading: loadingEpoch,
    isFetched: epochFetched,
  } = useCurrentEpoch();
  const epoch = defaultEpoch ?? currentEpoch;
  const isEnded = !currentEpoch || !epoch || epoch !== currentEpoch || loadingEpoch;

  const {
    data: notes,
    isLoading: loadingNotes,
    isFetched: notesFetched,
  } = useLQTNotes(subaccount, epoch, isEnded);
  const { data: votes, isLoading: loadingVotes } = useTournamentVotes(epoch, isEnded);
  const {
    data: delegations,
    isLoading: delegationsLoading,
    isFetched: delegationsFetched,
  } = useAccountDelegations(isEnded || !!notes?.length);
  const { data: stakingTokenMetadata } = useStakingTokenMetadata();

  const delUMMetadata = useMemo(() => {
    const cloned = stakingTokenMetadata.clone();
    cloned.symbol = 'delUM';
    return cloned;
  }, [stakingTokenMetadata]);

  const isLoading =
    (loadingEpoch && !epochFetched) ||
    (loadingNotes && !notesFetched) ||
    (delegationsLoading && !delegationsFetched);
  const isVoted = !!votes?.length;
  const isDelegated = !!delegations?.length;

  const votingNote = useMemo(() => {
    if (!notes?.length) {
      return undefined;
    }

    const values = notes.flatMap(n => n.noteRecord?.note?.value ?? []);
    if (!values.length) {
      return undefined;
    }

    const amount = values.reduce(
      (accum, current) => (current.amount ? addAmounts(accum, current.amount) : accum),
      new Amount({ lo: 0n, hi: 0n }),
    );

    return new ValueView({
      valueView: {
        case: 'knownAssetId',
        value: {
          amount,
          metadata: delUMMetadata,
        },
      },
    });
  }, [delUMMetadata, notes]);

  const votedFor = useMemo(() => {
    const vote = votes?.[0];
    const metadata = getMetadata(vote?.incentivizedAsset);
    if (!metadata) {
      return undefined;
    }
    return new ValueView({
      valueView: {
        case: 'knownAssetId',
        value: {
          amount: new Amount({ lo: 0n, hi: 0n }),
          metadata,
        },
      },
    });
  }, [getMetadata, votes]);

  return {
    epoch,
    connected,
    isEnded,
    isLoading,
    loadingVotes,
    isVoted,
    votedFor,
    isDelegated,
    currentEpoch,
    votingNote,
  };
};

const STAKING_LINK = 'https://app.penumbra.zone/#/staking';

export interface VotingInfoProps {
  epoch?: number;
}

export const VotingInfo = observer(({ epoch: defaultEpoch }: VotingInfoProps) => {
  const {
    epoch,
    isVoted,
    isEnded,
    isLoading,
    votedFor,
    connected,
    isDelegated,
    votingNote,
    currentEpoch,
  } = useVotingInfo(defaultEpoch);

  const isRoundPage = !!defaultEpoch;
  const epochLink = epoch ? PagePath.TournamentRound.replace(':epoch', epoch.toString()) : '';
  const currentEpochLink = currentEpoch
    ? PagePath.TournamentRound.replace(':epoch', currentEpoch.toString())
    : PagePath.Tournament;
  const tradeLink = useMemo(() => {
    const metadata = getMetadataFromValueView.optional(votedFor);
    if (!metadata) {
      return PagePath.Trade;
    }

    return PagePath.TradePair.replace(
      ':primary',
      metadata.symbol === 'USDC' ? 'UM' : metadata.symbol,
    ).replace(':numeraire', 'USDC');
  }, [votedFor]);

  const votedComponent = useMemo(() => {
    if (!isVoted) {
      return null;
    }
    return (
      <div className='flex items-center gap-4'>
        <div className='size-10 text-success-light'>
          <Check className='h-full w-full' />
        </div>
        <Text variant='small' color='text.secondary'>
          You have already voted in this epoch. Come back next epoch to vote again.
        </Text>
        {votedFor && <ValueViewComponent showValue={false} valueView={votedFor} />}
      </div>
    );
  }, [isVoted, votedFor]);

  const [isVoteDialogueOpen, setIsVoteDialogOpen] = useState(false);

  const openVoteDialog = () => {
    setIsVoteDialogOpen(true);
  };

  const closeVoteDialog = () => {
    setIsVoteDialogOpen(false);
  };

  if (isLoading) {
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

  if (!connected) {
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

  if (isRoundPage && isEnded) {
    return (
      <div className='flex flex-col gap-8'>
        <div className='flex items-center gap-4'>
          {isVoted ? (
            votedComponent
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

  if (isVoted) {
    return (
      <div className='flex flex-col gap-8'>
        {votedComponent}

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

  if (votingNote) {
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
            <ValueViewComponent valueView={votingNote} />
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

        <VoteDialogueSelector isOpen={isVoteDialogueOpen} onClose={closeVoteDialog} />
      </>
    );
  }

  if (isDelegated) {
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
