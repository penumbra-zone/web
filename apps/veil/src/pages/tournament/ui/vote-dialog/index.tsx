import { useState } from 'react';
import { Search } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { Dialog } from '@penumbra-zone/ui/Dialog';
import { Text } from '@penumbra-zone/ui/Text';
import { Button } from '@penumbra-zone/ui/Button';
import { Density } from '@penumbra-zone/ui/Density';
import { Checkbox } from '@penumbra-zone/ui/Checkbox';
import { TextInput } from '@penumbra-zone/ui/TextInput';
import { SpendableNoteRecord } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { lqtAddressIndex } from '@penumbra-zone/types/address';
import { voteTournament } from '@/entities/tournament/api/vote';
import { connectionStore } from '@/shared/model/connection';
import { useLQTNotes } from '../../api/use-voting-notes';
import { useCurrentEpoch } from '../../api/use-current-epoch';
import { useEpochResults } from '../../api/use-epoch-results';
import { MappedGauge } from '../../server/previous-epochs';
import { VoteDialogSearchResults } from './search-results';
import { VotingAssetSelector } from './asset-selector';
import { Address } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { penumbra } from '@/shared/const/penumbra';
import { ViewService } from '@penumbra-zone/protobuf';

interface VoteDialogProps {
  defaultValue?: MappedGauge;
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_REVEAL_VOTE = true;

export const VoteDialogueSelector = observer(
  ({ isOpen, onClose, defaultValue }: VoteDialogProps) => {
    const [selectedAsset, setSelectedAsset] = useState<MappedGauge | undefined>(defaultValue);
    const [revealVote, setRevealVote] = useState(DEFAULT_REVEAL_VOTE);

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const { subaccount } = connectionStore;

    // Fetch user's spendable voting notes for this epoch
    const { epoch, isLoading: epochLoading } = useCurrentEpoch();

    const { data: notes } = useLQTNotes(subaccount, epoch);
    const { isLoading, assetGauges } = useEpochResults(
      'epoch-results-vote-dialog',
      {
        epoch,
        limit: 30,
        page: 1,
      },
      !isOpen && epochLoading,
      searchQuery,
    );

    const handleVoteSubmit = async () => {
      if (!selectedAsset) {
        throw new Error('Please, select an asset to vote for');
      }

      if (!epoch) {
        throw new Error('Missing epoch index');
      }

      const stakedNotes: SpendableNoteRecord[] = notes
        ? notes
            .filter(n => !n.alreadyVoted)
            .map(n => n.noteRecord)
            .filter((r): r is SpendableNoteRecord => !!r && r.heightSpent === 0n)
        : [];

      let rewardsRecipient: Address | undefined;
      if (revealVote) {
        const res = await penumbra
          .service(ViewService)
          .addressByIndex({ addressIndex: lqtAddressIndex(subaccount) });
        rewardsRecipient = res.address;
      } else {
        const res = await penumbra
          .service(ViewService)
          .ephemeralAddress({ addressIndex: { account: subaccount } });
        rewardsRecipient = res.address;
      }

      // Craft LQT TPR and submit vote
      await voteTournament({
        stakedNotes: stakedNotes,
        incentivized: selectedAsset.asset.base,
        epochIndex: epoch,
        rewardsRecipient,
      });

      handleClose();
    };

    const handleClose = () => {
      setSearchQuery('');
      setSelectedAsset(undefined);
      setIsSearchOpen(false);
      setRevealVote(DEFAULT_REVEAL_VOTE);
      onClose();
    };

    const onSearchSelect = (asset: MappedGauge) => {
      setSearchQuery('');
      setIsSearchOpen(false);
      setSelectedAsset(asset);
    };

    return (
      <Dialog isOpen={isOpen} onClose={handleClose}>
        <Dialog.Content
          title={`Vote in epoch #${epoch}`}
          headerChildren={
            <>
              {/* Focus catcher. If this button wouldn't exist, the focus would go to the first input, which is undesirable */}
              <button type='button' className='-mt-2 h-0 w-full focus:outline-hidden' />

              <Text detail color='text.secondary'>
                You can only vote for one asset in an epoch and can&#39;t change your vote
                afterwards.
              </Text>
              <div className='mt-2 [&>label]:h-12'>
                <TextInput
                  value={searchQuery}
                  placeholder='Search...'
                  onChange={setSearchQuery}
                  onFocus={() => setIsSearchOpen(true)}
                  startAdornment={
                    <i className='flex size-6 items-center justify-center'>
                      <Search className='size-4 text-neutral-light' />
                    </i>
                  }
                />
              </div>
            </>
          }
          buttons={
            !isSearchOpen && (
              <div className='flex flex-col gap-6 px-6 pb-6 [&>label]:justify-center [&>label>div]:grow-0'>
                <Density sparse>
                  <Button
                    onClick={() => {
                      onClose();
                      handleVoteSubmit().catch((err: unknown) => console.error(err));
                    }}
                    priority='primary'
                    actionType='accent'
                    disabled={!selectedAsset}
                  >
                    {selectedAsset
                      ? `Vote for ${selectedAsset.asset.symbol}`
                      : 'Select asset to vote'}
                  </Button>
                </Density>

                <Checkbox
                  title='Reveal my vote to the leaderboard.'
                  description='Voting in each epoch grows your streak.'
                  checked={revealVote}
                  onChange={value => setRevealVote(value as boolean)}
                />
              </div>
            )
          }
        >
          <div className='flex flex-col pt-2'>
            {!isSearchOpen && (
              <VotingAssetSelector
                selectedAsset={selectedAsset}
                loading={isLoading}
                gauge={assetGauges}
                onSelect={onSearchSelect}
              />
            )}

            {isSearchOpen && (
              <VoteDialogSearchResults
                value={selectedAsset?.asset.base}
                gauge={assetGauges}
                onSelect={onSearchSelect}
              />
            )}
          </div>
        </Dialog.Content>
      </Dialog>
    );
  },
);
