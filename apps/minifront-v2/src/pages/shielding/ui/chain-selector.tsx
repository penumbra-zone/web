import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { TextInput } from '@penumbra-zone/ui/TextInput';
import { Dialog } from '@penumbra-zone/ui/Dialog';
import { IconAdornment } from '@penumbra-zone/ui/IconAdornment';
import { Text } from '@penumbra-zone/ui/Text';
import { ChevronsUpDown, Search } from 'lucide-react';
import { ChainInfo } from '@/shared/stores/deposit-store';
import { Icon } from '@penumbra-zone/ui/Icon';

export interface ChainSelectorProps {
  /** The currently selected chain */
  selectedChain?: ChainInfo;
  /** Available chains to select from */
  availableChains: ChainInfo[];
  /** Callback when a chain is selected */
  onSelectChain: (chain: ChainInfo) => void;
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** Placeholder text for when no chain is selected */
  placeholder?: string;
}

export const ChainSelector = observer(
  ({
    selectedChain,
    availableChains,
    onSelectChain,
    disabled = false,
    placeholder = 'Select Source Chain...',
  }: ChainSelectorProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');

    // Filter chains based on search
    const filteredChains = availableChains.filter(
      chain =>
        chain.displayName.toLowerCase().includes(searchValue.toLowerCase()) ||
        chain.chainName.toLowerCase().includes(searchValue.toLowerCase()),
    );

    const handleChainSelect = (chain: ChainInfo) => {
      onSelectChain(chain);
      setIsOpen(false);
      setSearchValue('');
    };

    const displayValue = selectedChain ? selectedChain.displayName : '';

    return (
      <>
        <div className={`${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
          <TextInput
            value={displayValue}
            placeholder={placeholder}
            disabled={disabled}
            onClick={() => !disabled && setIsOpen(true)}
            endAdornment={<IconAdornment icon={ChevronsUpDown} size='sm' disabled={disabled} />}
          />
        </div>

        <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <Dialog.Content title='Select Chain'>
            <div className='flex flex-col gap-4 p-1 py-2'>
              {/* Search input */}
              <TextInput
                value={searchValue}
                onChange={setSearchValue}
                placeholder='Search...'
                startAdornment={<Icon size='sm' IconComponent={Search} color='text.primary' />}
              />

              {/* Chain list */}
              <div className='flex max-h-100 flex-col gap-1 overflow-y-auto'>
                {filteredChains.length === 0 ? (
                  <div className='flex h-20 items-center justify-center'>
                    <Text color='text.secondary' small>
                      {searchValue ? 'No chains found' : 'No chains available'}
                    </Text>
                  </div>
                ) : (
                  <>
                    <Text small color='text.secondary'>
                      Available Chains
                    </Text>
                    {filteredChains.map(chain => (
                      <ChainItem key={chain.chainId} chain={chain} onSelect={handleChainSelect} />
                    ))}
                  </>
                )}
              </div>
            </div>
          </Dialog.Content>
        </Dialog>
      </>
    );
  },
);

interface ChainItemProps {
  chain: ChainInfo;
  onSelect: (chain: ChainInfo) => void;
}

const ChainItem = observer(({ chain, onSelect }: ChainItemProps) => {
  return (
    <button
      onClick={() => onSelect(chain)}
      className={`flex w-full items-center gap-3 rounded-sm p-3 text-left transition-colors hover:bg-action-hover-overlay focus:bg-action-hover-overlay bg-other-tonal-fill5 focus:outline-none cursor-pointer`}
    >
      {/* Chain icon */}
      {chain.icon ? (
        <img src={chain.icon} alt={chain.displayName} className='size-8 rounded-full' />
      ) : (
        <div className='flex size-8 items-center justify-center rounded-full bg-other-tonal-stroke'>
          <Text color='text.primary' small>
            {chain.displayName.charAt(0).toUpperCase()}
          </Text>
        </div>
      )}

      {/* Chain info */}
      <div className='flex-1'>
        <Text color='text.primary' strong>
          {chain.displayName}
        </Text>
      </div>

      {/* Connection status */}
      {chain.isConnected && (
        <div className='flex items-center gap-1'>
          <div className='size-2 rounded-full bg-success-light' />
          <Text color='success.light' small>
            Connected
          </Text>
        </div>
      )}
    </button>
  );
});
