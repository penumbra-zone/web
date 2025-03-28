import Link from 'next/link';
import { ConnectButton } from '@/features/connect/connect-button';
import { connectionStore } from '@/shared/model/connection';
import { Button } from '@penumbra-zone/ui/Button';
import { Text } from '@penumbra-zone/ui/Text';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { Metadata, ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { Amount } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';
import { Ban, Coins, Check, Wallet2, ExternalLink } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { PagePath } from '@/shared/const/pages';

export const VotingSection = observer(
  ({ isBanned, epoch }: { isBanned: boolean; epoch: number }) => {
    const { connected } = connectionStore;

    // dummy data
    const delegatedAmount = 1000;
    const currentEpoch = 136;
    const didVote = false;
    const epochEnded = currentEpoch > epoch;
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
        <>
          <div className='flex gap-4 color-text-secondary items-center'>
            <div className='size-8 text-text-secondary'>
              <Wallet2 className='w-full h-full' />
            </div>
            <Text variant='small' color='text.secondary'>
              Connect Prax Wallet to vote in this epoch.
            </Text>
          </div>
          <div className='flex gap-2'>
            <ConnectButton actionType='accent' variant='default'>
              Connect Prax Wallet
            </ConnectButton>
          </div>
        </>
      );
    }

    if (isBanned) {
      return (
        <>
          <div className='flex gap-4 color-text-secondary items-center'>
            <div className='size-14 text-destructive-light'>
              <Ban className='w-full h-full' />
            </div>
            <Text variant='small' color='text.secondary'>
              You can’t vote in this epoch because you delegated UM after the epoch started. You’ll
              be able to vote next epoch.
            </Text>
          </div>
          <div className='flex gap-2'>
            <Button actionType='accent' disabled>
              Vote Now
            </Button>
          </div>
        </>
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- temporary
    if (didVote) {
      if (epochEnded) {
        return (
          <>
            <div className='flex gap-4 color-text-secondary items-center'>
              <div className='size-10 text-success-light'>
                <Check className='w-full h-full' />
              </div>
              <Text variant='small' color='text.secondary'>
                You have already voted in this epoch. Come back next epoch to vote again.
              </Text>
              <ValueViewComponent valueView={valueView} />
            </div>
            <Link href={PagePath.TournamentRound.replace(':epoch', currentEpoch.toString())}>
              <Button actionType='default'>Go To Current Epoch #{currentEpoch}</Button>
            </Link>
          </>
        );
      }

      return (
        <div className='flex gap-4 color-text-secondary items-center'>
          <div className='size-10 text-success-light'>
            <Check className='w-full h-full' />
          </div>
          <Text variant='small' color='text.secondary'>
            You have already voted in this epoch. Come back next epoch to vote again.
          </Text>
          <ValueViewComponent valueView={valueView} />
        </div>
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- temporary
    if (delegatedAmount) {
      return (
        <>
          <div className='flex gap-4 color-text-secondary items-center'>
            <div className='size-10 text-text-secondary'>
              <Coins className='w-full h-full' />
            </div>
            <Text variant='small' color='text.secondary'>
              You’ve delegated UM and now eligible to vote in this epoch.
            </Text>
            <ValueViewComponent valueView={valueView} />
          </div>
          <div className='flex gap-2'>
            <Button actionType='accent' icon={ExternalLink}>
              Delegate
            </Button>
          </div>
        </>
      );
    }

    return (
      <>
        <div className='flex gap-4 color-text-secondary items-center'>
          <div className='size-10 text-text-secondary'>
            <Coins className='w-full h-full' />
          </div>
          <Text variant='small' color='text.secondary'>
            Delegate UM to vote and influence how incentives are distributed in this epoch.
          </Text>
        </div>
        <div className='flex gap-2'>
          <Button actionType='accent' icon={ExternalLink}>
            Delegate
          </Button>
        </div>
      </>
    );
  },
);
