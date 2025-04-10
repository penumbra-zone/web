import { useState } from 'react';
import { Text } from '@penumbra-zone/ui/Text';
import { Button } from '@penumbra-zone/ui/Button';

// Stub data - would come from a hook or store in the real implementation
const availableChains = [
  { id: 'cosmos-hub', name: 'Cosmos Hub', prefix: 'cosmos' },
  { id: 'osmosis', name: 'Osmosis', prefix: 'osmo' },
  { id: 'juno', name: 'Juno', prefix: 'juno' },
];

interface ChainSelectorProps {
  selectedChain?: string;
  onChainSelect: (chainId: string) => void;
}

export const ChainSelector = ({ selectedChain, onChainSelect }: ChainSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedChainData = availableChains.find(chain => chain.id === selectedChain);

  return (
    <div className='relative'>
      <div className='mb-2 block'>
        <Text color='text.primary'>Destination Chain</Text>
      </div>

      <Button onClick={() => setIsOpen(!isOpen)} priority='secondary'>
        <div className='w-full flex justify-between'>
          <span>{selectedChainData?.name ?? 'Select a chain'}</span>
          <span className='ml-2'>▼</span>
        </div>
      </Button>

      {isOpen && (
        <div className='absolute z-10 w-full mt-1 p-2 rounded-md bg-black border border-border'>
          <div className='flex flex-col gap-1'>
            {availableChains.map(chain => (
              <Button
                key={chain.id}
                priority='secondary'
                onClick={() => {
                  onChainSelect(chain.id);
                  setIsOpen(false);
                }}
              >
                <Text color='text.primary'>{chain.name}</Text>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
