import { useState } from 'react';
import { Search } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { Dialog } from '@penumbra-zone/ui/Dialog';
import { Text } from '@penumbra-zone/ui/Text';
import { Button } from '@penumbra-zone/ui/Button';
import { Checkbox } from '@penumbra-zone/ui/Checkbox';
import { TextInput } from '@penumbra-zone/ui/TextInput';
import { SpendableNoteRecord } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { useSubaccounts } from '@/widgets/header/api/subaccounts';
import { connectionStore } from '@/shared/model/connection';
import { getAddressIndex } from '@penumbra-zone/getters/address-view';
import { useLQTNotes } from '../../api/use-voting-notes';
import { voteTournament } from '../../api/vote';
import { useCurrentEpoch } from '../../api/use-current-epoch';
import { useEpochGauge } from '../../api/use-epoch-gauge';
import { MappedGauge } from '../../server/previous-epochs';
import { VoteDialogSearchResults } from './search-results';
import { VotingAssetSelector } from './asset-selector';

interface VoteDialogProps {
  defaultValue?: string;
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_REVEAL_VOTE = true;

export const VoteDialogueSelector = observer(
  ({ isOpen, onClose, defaultValue }: VoteDialogProps) => {
    const [selectedDenom, setSelectedDenom] = useState<string | undefined>(defaultValue);
    const [selectedAsset, setSelectedAsset] = useState<MappedGauge | undefined>();
    const [revealVote, setRevealVote] = useState(DEFAULT_REVEAL_VOTE);

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const { data: subaccounts } = useSubaccounts();

    const { subaccount } = connectionStore;
    const valueAddress = subaccounts?.find(
      account => getAddressIndex(account).account === subaccount,
    );

    const rewardsRecipient = valueAddress?.addressView.value?.address;

    // Fetch user's spendable voting notes for this epoch
    const { epoch } = useCurrentEpoch();
    const { data: notes } = useLQTNotes(subaccount, epoch);

    const { data: assets, isLoading } = useEpochGauge(epoch);
    const isEmptyScreen = !isLoading && !!assets && !assets.length;

    const handleVoteSubmit = async () => {
      if (selectedDenom) {
        if (!epoch) {
          throw new Error('Missing epoch index');
        }

        const stakedNotes: SpendableNoteRecord[] = notes
          ? Array.from(notes.values())
              .map(res => res.noteRecord)
              .filter((record): record is SpendableNoteRecord => !!record)
          : [];

        // Craft LQT TPR and submit vote
        await voteTournament({
          stakedNotes: stakedNotes,
          incentivized: selectedDenom,
          epochIndex: epoch,
          rewardsRecipient,
        });

        handleClose();
      }
    };

    const handleClose = () => {
      setSearchQuery('');
      setSelectedDenom(undefined);
      setSelectedAsset(undefined);
      setIsSearchOpen(false);
      setRevealVote(DEFAULT_REVEAL_VOTE);
      onClose();
    };

    const onSearchSelect = (asset: MappedGauge) => {
      setSearchQuery('');
      setIsSearchOpen(false);
      setSelectedDenom(asset.asset.base);
      setSelectedAsset(asset);
    };

    return (
      <Dialog isOpen={isOpen} onClose={handleClose}>
        <Dialog.Content
          title={`Vote in epoch #${epoch}`}
          headerChildren={
            <>
              {/* Focus catcher. If this button wouldn't exist, the focus would go to the first input, which is undesirable */}
              <button type='button' className='w-full h-0 -mt-2 focus:outline-none' />

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
                    <i className='flex items-center justify-center size-6'>
                      <Search className='size-4 text-neutral-light' />
                    </i>
                  }
                />
              </div>
            </>
          }
          buttons={
            !isSearchOpen && (
              <div className='flex flex-col gap-6 px-6 pb-6 pt-2 [&>label]:justify-center [&>label>div]:grow-0'>
                <Button
                  onClick={() => {
                    onClose();
                    handleVoteSubmit().catch((err: unknown) => console.error(err));
                  }}
                  priority='primary'
                  actionType='accent'
                  disabled={!selectedDenom}
                >
                  {selectedDenom
                    ? `Vote for ${selectedAsset?.asset.symbol ?? selectedDenom.toUpperCase()}`
                    : 'Select asset to vote'}
                </Button>

                <Checkbox
                  title='Reveal my vote to the leaderboard.'
                  description='Voting each epoch grows your streak.'
                  checked={revealVote}
                  onChange={value => setRevealVote(value as boolean)}
                />
              </div>
            )
          }
        >
          <div className='flex flex-col pt-2'>
            {!isSearchOpen && !isEmptyScreen && (
              <VotingAssetSelector
                value={selectedDenom}
                selectedAsset={selectedAsset}
                loading={isLoading}
                gauge={assets ?? []}
                onSelect={onSearchSelect}
              />
            )}

            {(isSearchOpen || isEmptyScreen) && (
              <VoteDialogSearchResults
                value={selectedDenom}
                gauge={assets ?? []}
                search={searchQuery}
                onSelect={onSearchSelect}
              />
            )}
          </div>
        </Dialog.Content>
      </Dialog>
    );
  },
);
