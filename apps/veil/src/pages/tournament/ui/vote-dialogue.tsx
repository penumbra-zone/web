import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Dialog } from '@penumbra-zone/ui/Dialog';
import { Text } from '@penumbra-zone/ui/Text';
import { Button } from '@penumbra-zone/ui/Button';
import { Search } from 'lucide-react';
import Image from 'next/image';
import { useLQTNotes } from '../api/use-voting-notes';
import { voteTournament } from '../api/vote';
import { SpendableNoteRecord } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { useSubaccounts } from '@/widgets/header/api/subaccounts';
import { connectionStore } from '@/shared/model/connection';
import { getAddressIndex } from '@penumbra-zone/getters/address-view';

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
    // TODO: replace this dummy static asset list with actual data from the API server.
    // Channel names are currently hardcoded to the penumbra-testnet-phobos-3 IBC channel
    // names in the chain registry.
    const assets: Asset[] = [
      {
        id: 'transfer/channel-1/uusdc',
        symbol: 'USDC',
        imgUrl:
          'https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png',
        percentage: 50,
      },
      {
        id: 'transfer/channel-0/uosmo',
        symbol: 'OSMO',
        imgUrl:
          'https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png',
        percentage: 25,
      },
      {
        id: 'transfer/channel-1/ustake',
        symbol: 'STAKE',
        imgUrl:
          'https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png',
        percentage: 5,
      },
      {
        id: 'transfer/channel-1/love',
        symbol: 'LOVE',
        imgUrl:
          'https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png',
        percentage: 4.5,
      },
      {
        id: 'transfer/channel-1/ausdy',
        symbol: 'USDY',
        imgUrl:
          'https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png',
        percentage: 2.5,
      },
    ];

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAsset, setSelectedAsset] = useState<string | null>(
      defaultValue ? (assets.find(asset => asset.symbol === defaultValue)?.symbol ?? null) : null,
    );
    const [revealVote, setRevealVote] = useState(false);

    const { data: subaccounts } = useSubaccounts();
    const { subaccount } = connectionStore;
    const valueAddress = subaccounts?.find(
      account => getAddressIndex(account).account === subaccount,
    );

    // Temporarily hardcode the same account address as the reward recipient.
    const rewardsRecipient = valueAddress?.addressView.value?.address;

    // Fetch user's spendable voting notes for this epoch
    const { notes, epochIndex } = useLQTNotes(subaccount);

    const filteredAssets = searchQuery
      ? assets.filter(a => a.symbol.toLowerCase().includes(searchQuery.toLowerCase()))
      : assets;

    const threshold = 5;
    const aboveThreshold = filteredAssets.filter(a => a.percentage >= threshold);
    const belowThreshold = filteredAssets.filter(a => a.percentage < threshold);

    const handleVoteSubmit = async () => {
      if (selectedAsset) {
        if (!epochIndex) {
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
          epochIndex: epochIndex,
          rewardsRecipient,
        });

        // TODO: save some kind of callback information to update UI component with corresponding vote information.

        onClose();
      }
    };

    const handleClose = () => {
      setSearchQuery('');
      setSelectedAsset(null);
      setRevealVote(false);
      onClose();
    };

    const hasResults = aboveThreshold.length > 0 || belowThreshold.length > 0;
    const showSearchResultsHeader =
      (searchQuery && !hasResults) ||
      (!searchQuery &&
        filteredAssets.length > 0 &&
        filteredAssets.every(a => a.percentage < threshold));

    /**
     * TODO: update checkbox with updated UI component
     *
     * @see https://github.com/penumbra-zone/web/issues/2192
     */
    return (
      <div className='relative flex items-center gap-2 text-text-primary'>
        <Dialog isOpen={isOpen} onClose={handleClose}>
          <Dialog.Content title={`Vote in epoch #${epochIndex}`}>
            <div className='[&_*:focus]:outline-none flex flex-col max-h-[120vh]'>
              <div className='relative mb-4'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                <input
                  type='text'
                  placeholder='Search...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className='w-full py-3 pl-10 pr-3 bg-[#2a2c2e] text-white rounded-md border-none focus:ring-0'
                />
              </div>

              {showSearchResultsHeader && (
                <Text small color='text.secondary'>
                  Search Results
                </Text>
              )}

              <div className='overflow-y-auto flex-1 pr-1 mt-2'>
                {hasResults ? (
                  <>
                    <AssetListGroup
                      label='Above threshold (≥5%)'
                      assets={aboveThreshold}
                      selectedAssetId={selectedAsset}
                      onSelect={setSelectedAsset}
                    />

                    <AssetListGroup
                      label='Below threshold (<5%)'
                      assets={belowThreshold}
                      selectedAssetId={selectedAsset}
                      onSelect={() => {}}
                      disableSelection
                    />
                  </>
                ) : (
                  <div className='flex flex-col items-center justify-center py-16 text-text-secondary gap-2'>
                    <Search className='w-8 h-8 text-text-secondary' />
                    <Text variant='body' color='text.secondary'>
                      No results
                    </Text>
                  </div>
                )}
              </div>

              <div className='pt-6 flex flex-col gap-4'>
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
                    ? `Vote for ${selectedAsset.toUpperCase()}`
                    : 'Select asset to vote'}
                </Button>

                <div className='flex items-center justify-center gap-2 mt-1'>
                  <div className='rounded-sm bg-[#cc5500] w-5 h-5 flex items-center justify-center relative'>
                    <input
                      type='checkbox'
                      id='reveal-vote'
                      checked={revealVote}
                      onChange={() => setRevealVote(!revealVote)}
                      className='opacity-0 absolute w-full h-full cursor-pointer'
                    />
                    {revealVote && (
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-4 w-4 text-white'
                        viewBox='0 0 20 20'
                        fill='currentColor'
                      >
                        <path
                          fillRule='evenodd'
                          d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                          clipRule='evenodd'
                        />
                      </svg>
                    )}
                  </div>
                  <label htmlFor='reveal-vote' className='text-white cursor-pointer'>
                    Reveal my vote to the leaderboard
                  </label>
                </div>
              </div>
            </div>
          </Dialog.Content>
        </Dialog>
      </div>
    );
  },
);
