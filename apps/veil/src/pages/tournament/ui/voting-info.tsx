import Link from 'next/link';
import { useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Ban, Coins, Check, Wallet2, ExternalLink } from 'lucide-react';
import { ValueView, Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { Amount } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';
import { addAmounts } from '@penumbra-zone/types/amount';
import { Button } from '@penumbra-zone/ui/Button';
import { Text } from '@penumbra-zone/ui/Text';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { ConnectButton } from '@/features/connect/connect-button';
import { connectionStore } from '@/shared/model/connection';
import { useGetMetadata } from '@/shared/api/assets';
import { PagePath } from '@/shared/const/pages';
import { useLQTNotes } from '../api/use-voting-notes';
import { useCurrentEpoch } from '../api/use-current-epoch';
import { VoteDialogueSelector } from './vote-dialog';
import { checkIfAlreadyVoted } from '../api/vote';

// TODO: use it for both landing and round page, apply all component states from Figma
export const VotingInfo = observer(() => {
  const { connected, subaccount } = connectionStore;

  const getMetadata = useGetMetadata();
  const { epoch } = useCurrentEpoch();
  const { data: notes } = useLQTNotes(subaccount, epoch);

  // Check if all notes have been used for voting in the current epoch.
  const allNotesVoted = checkIfAlreadyVoted({ votingNotes: notes });
  const epochLink = epoch ? PagePath.TournamentRound.replace(':epoch', epoch.toString()) : '';

  const aggregatedNotes = useMemo(() => {
    const values = (notes ?? []).map(note => note.noteRecord?.note?.value).filter(item => !!item);

    const amount = values.reduce(
      (accum, current) => {
        if (current.amount) {
          return addAmounts(accum, current.amount);
        }
        return accum;
      },
      new Amount({ lo: 0n, hi: 0n }),
    );

    const metadata = values[0]?.assetId && getMetadata(values[0].assetId);

    if (!values.length || !metadata) {
      return undefined;
    }

    return new ValueView({
      valueView: {
        case: 'knownAssetId',
        value: {
          amount,
          metadata: {
            ...metadata,
            // noted can represent delUM from different validators,
            // so this symbol hides the validator
            symbol: 'delUM',
          },
        },
      },
    });
  }, [getMetadata, notes]);

  const [isVoteDialogueOpen, setIsVoteDialogOpen] = useState(false);

  const openVoteDialog = () => {
    setIsVoteDialogOpen(true);
  };

  const closeVoteDialog = () => {
    setIsVoteDialogOpen(false);
  };

  // dummy data
  const didVote = false;
  const valueView = new ValueView({
    valueView: {
      value: {
        amount: new Amount({ lo: 133700000n }),
        metadata: new Metadata({
          base: 'um',
          display: 'um',
          denomUnits: [
            {
              denom: 'um',
              exponent: 6,
            },
          ],
          symbol: 'um',
          penumbraAssetId: { inner: new Uint8Array([1]) },
          coingeckoId: 'um',
          images: [],
          name: 'um',
          description: 'um',
        }),
      },
      case: 'knownAssetId',
    },
  });

  if (!connected) {
    return (
      <div className='flex flex-col gap-8'>
        <div className='flex gap-4 color-text-secondary items-center'>
          <div className='size-8 text-text-secondary'>
            <Wallet2 className='w-full h-full' />
          </div>
          <Text variant='small' color='text.secondary'>
            Connect Prax Wallet to vote in this epoch and see your rewards from participating.
          </Text>
        </div>
        <div className='flex gap-2'>
          <ConnectButton actionType='accent' variant='default'>
            Connect Prax Wallet
          </ConnectButton>
          <Link href={epochLink}>
            <Button actionType='default'>Details</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (allNotesVoted) {
    return (
      <div className='flex flex-col gap-8'>
        <div className='flex gap-4 color-text-secondary items-center'>
          <div className='size-14 text-destructive-light'>
            <Ban className='w-full h-full' />
          </div>
          <Text variant='small' color='text.secondary'>
            You can&#39;t vote in this epoch because you delegated your UM after the epoch started.
            You&#39;ll be able to vote next epoch.
          </Text>
        </div>
        <div className='flex gap-2'>
          <div className='flex-1'>
            <Button actionType='accent' disabled>
              Vote Now
            </Button>
          </div>
          <div className='flex-1'>
            <Link href={epochLink}>
              <Button actionType='default'>Details</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- temporary
  if (didVote) {
    return (
      <div className='flex flex-col gap-8'>
        <div className='flex gap-4 color-text-secondary items-center'>
          <div className='size-10 text-success-light'>
            <Check className='w-full h-full' />
          </div>
          <Text variant='small' color='text.secondary'>
            You have already voted in this epoch. Come back next epoch to vote again.
          </Text>
          <ValueViewComponent valueView={valueView} />
        </div>
        <div className='flex gap-2'>
          <Link href={epochLink}>
            <Button actionType='default'>Details</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (notes?.length) {
    return (
      <>
        <div className='flex flex-col gap-8'>
          <div className='flex gap-4 color-text-secondary items-center'>
            <div className='size-10 text-text-secondary'>
              <Coins className='w-full h-full' />
            </div>
            <Text variant='small' color='text.secondary'>
              You&#39;ve delegated UM and can now vote with your delUM in this epoch.
            </Text>
            {aggregatedNotes && <ValueViewComponent valueView={aggregatedNotes} />}
          </div>
          <div className='flex gap-2 w-full'>
            <div className='flex-1 max-w-[300px]'>
              <Button actionType='accent' onClick={openVoteDialog}>
                Vote Now
              </Button>
            </div>
            <div className='flex-1'>
              <Link href={epochLink}>
                <Button actionType='default'>Details</Button>
              </Link>
            </div>
          </div>
        </div>

        <VoteDialogueSelector isOpen={isVoteDialogueOpen} onClose={closeVoteDialog} />
      </>
    );
  }

  return (
    <div className='flex flex-col gap-8'>
      <div className='flex gap-4 color-text-secondary items-center'>
        <div className='size-10 text-text-secondary'>
          <Coins className='w-full h-full' />
        </div>
        <Text variant='small' color='text.secondary'>
          Delegate UM to vote and influence how incentives are distributed in this epoch.
        </Text>
      </div>
      <div className='flex gap-2'>
        <div className='flex-1'>
          <Button actionType='accent' icon={ExternalLink}>
            Delegate
          </Button>
        </div>
        <div className='flex-1'>
          <Link href={epochLink}>
            <Button actionType='default'>Details</Button>
          </Link>
        </div>
      </div>
    </div>
  );
});
