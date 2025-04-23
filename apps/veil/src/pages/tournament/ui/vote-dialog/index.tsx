import Image from 'next/image';
import { useState } from 'react';
import { Search } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { Dialog } from '@penumbra-zone/ui/Dialog';
import { Text } from '@penumbra-zone/ui/Text';
import { Button } from '@penumbra-zone/ui/Button';
import { Checkbox } from '@penumbra-zone/ui/Checkbox';
import { AssetIcon } from '@penumbra-zone/ui/AssetIcon';
import { TextInput } from '@penumbra-zone/ui/TextInput';
import { SpendableNoteRecord } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { useSubaccounts } from '@/widgets/header/api/subaccounts';
import { connectionStore } from '@/shared/model/connection';
import { getAddressIndex } from '@penumbra-zone/getters/address-view';
import { useLQTNotes } from '../../api/use-voting-notes';
import { voteTournament } from '../../api/vote';
import { useCurrentEpoch } from '../../api/use-current-epoch';
import { useEpochGauge } from '../../api/use-epoch-gauge';
import { VoteDialogSearchResults } from '@/pages/tournament/ui/vote-dialog/search-results';

interface VoteDialogProps {
  defaultValue?: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Asset {
  id: string;
  symbol: string;
  imgUrl: string;
  percentage: number;
}

const AssetListGroup = ({
  label,
  assets,
  selectedAssetId,
  onSelect,
  disableSelection = false,
}: {
  label: string;
  assets: Asset[];
  selectedAssetId: string | null;
  onSelect: (id: string) => void;
  disableSelection?: boolean;
}) => {
  if (!assets.length) {
    return null;
  }

  return (
    <div className='mt-3 flex flex-col gap-1'>
      <Text small color='text.secondary'>
        {label}
      </Text>
      <div className='flex flex-col gap-1'>
        {assets.map(asset => {
          const isSelected = selectedAssetId === asset.id && !disableSelection;

          return (
            <button
              key={asset.id}
              onClick={() => !disableSelection && onSelect(asset.id)}
              className={`w-full text-left rounded-xl px-4 py-2 ${
                isSelected ? 'bg-[#1e2c2b]' : ''
              } ${disableSelection ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#202425] transition'}`}
              disabled={disableSelection}
            >
              <div className='flex gap-3'>
                <Image
                  src={asset.imgUrl}
                  alt={asset.symbol}
                  width={32}
                  height={32}
                  className='rounded-full'
                />
                <div className='flex w-full flex-col gap-2'>
                  <div className='flex justify-between w-full'>
                    <Text technical color='text.primary'>
                      {asset.symbol}
                    </Text>
                    <Text
                      technical
                      color={asset.percentage >= 5 ? 'text.primary' : 'text.secondary'}
                    >
                      {asset.percentage}%
                    </Text>
                  </div>
                  <div className='flex w-full h-[6px] bg-other-tonalFill5 rounded-full'>
                    <div
                      className={`h-[6px] rounded-full ${
                        disableSelection ? 'bg-[#888888]' : 'bg-secondary-light'
                      }`}
                      style={{ width: `${asset.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const VoteDialogueSelector = observer(
  ({ isOpen, onClose, defaultValue }: VoteDialogProps) => {

    // todo: default value
    const [selectedAsset, setSelectedAsset] = useState<string | undefined>(defaultValue);
    const [revealVote, setRevealVote] = useState(false);

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const { data: subaccounts } = useSubaccounts();

    const { subaccount } = connectionStore;
    const valueAddress = subaccounts?.find(
      account => getAddressIndex(account).account === subaccount,
    );

    // Temporarily hardcode the same account address as the reward recipient.
    const rewardsRecipient = valueAddress?.addressView.value?.address;

    // Fetch user's spendable voting notes for this epoch
    const { notes } = useLQTNotes(subaccount);
    const { epoch } = useCurrentEpoch();
    const { data: assets, isLoading } = useEpochGauge(epoch);

    const handleVoteSubmit = async () => {
      if (selectedAsset) {
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
          incentivized: selectedAsset,
          epochIndex: epoch,
          rewardsRecipient,
        });

        // TODO: save some kind of callback information to update UI component with corresponding vote information.

        onClose();
      }
    };

    const handleClose = () => {
      setSearchQuery('');
      setSelectedAsset(undefined);
      setRevealVote(false);
      onClose();
    };

    return (
      <Dialog isOpen={isOpen} onClose={handleClose}>
        <Dialog.Content
          title={`Vote in epoch #${epoch}`}
          headerChildren={(
            <>
              {/* Focus catcher. If this button wouldn't exist, the focus would go to the first input, which is undesirable */}
              <button type='button' className='w-full h-0 -mt-2 focus:outline-none' />

              <Text detail color='text.secondary'>
                You can only vote for one asset in an epoch and can&#39;t change your vote afterwards.
              </Text>
              <div className='mt-2 [&>label]:h-12'>
                <TextInput
                  value={searchQuery}
                  placeholder='Search...'
                  onChange={setSearchQuery}
                  onFocus={() => setIsSearchOpen(true)}
                  startAdornment={(
                    <i className='flex items-center justify-center size-6'>
                      <Search className='size-4 text-neutral-light' />
                    </i>
                  )}
                />
              </div>
            </>
          )}
        >
          <div className='flex flex-col pt-2'>
            {isSearchOpen && (
              <VoteDialogSearchResults gauge={assets ?? []} search={searchQuery} />
            )}

            <div className='overflow-y-auto flex-1 pr-1 mt-2'>
              {!isLoading && !assets?.length && (
                <div className='flex flex-col items-center justify-center py-16 text-text-secondary gap-2'>
                  <Search className='w-8 h-8 text-text-secondary' />
                  <Text variant='body' color='text.secondary'>
                    No results
                  </Text>
                </div>
              )}

              <Dialog.RadioGroup>
                {assets?.map(asset => (
                  <Dialog.RadioItem
                    key={asset.asset.base}
                    title={asset.asset.symbol}
                    value={asset.asset.base}
                    startAdornment={<AssetIcon metadata={asset.asset} />}
                  />
                ))}
              </Dialog.RadioGroup>
            </div>

            <div className='pt-6 flex flex-col gap-4 [&>label]:justify-center [&>label>div]:grow-0'>
              <Button
                onClick={() => {
                  onClose();
                  handleVoteSubmit().catch((err: unknown) => console.error(err));
                }}
                priority='primary'
                actionType='accent'
                disabled={!selectedAsset}
              >
                {selectedAsset ? `Vote for ${selectedAsset.toUpperCase()}` : 'Select asset to vote'}
              </Button>

              <Checkbox
                title='Reveal my vote to the leaderboard.'
                description='Voting each epoch grows your streak.'
                checked={revealVote}
                onChange={value => setRevealVote(value as boolean)}
              />
            </div>
          </div>
        </Dialog.Content>
      </Dialog>
    );
  },
);
