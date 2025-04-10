import { useState } from 'react';
import { Text } from '@penumbra-zone/ui/Text';
import { Button } from '@penumbra-zone/ui/Button';
import { TextInput } from '@penumbra-zone/ui/TextInput';
import { InputBlock } from './input-block';
import { UnifiedAsset } from '@/pages/portfolio/api/use-unified-assets';

interface Validation {
  type: 'error' | 'warning';
  issue: string;
  checkFn: () => boolean;
}

interface InputTokenProps {
  label: string;
  placeholder?: string;
  className?: string;
  value: string;
  onInputChange: (value: string) => void;
  validations?: Validation[];
  balances: UnifiedAsset[];
  selection?: UnifiedAsset | null;
  setSelection: (asset: UnifiedAsset | null) => void;
}

export const InputToken = ({
  label,
  placeholder,
  className = '',
  value,
  onInputChange,
  validations = [],
  balances,
  selection,
  setSelection,
}: InputTokenProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <InputBlock label={label} className={className} validations={validations}>
      <div className='flex items-center'>
        <TextInput
          placeholder={placeholder}
          value={value}
          onChange={onInputChange}
          type='number'
          endAdornment={
            <Button onClick={() => setIsOpen(!isOpen)} priority='secondary'>
              {selection ? selection.metadata.display : 'Select asset'}
              <span className='ml-2'>▼</span>
            </Button>
          }
        />

        {isOpen && (
          <div className='absolute z-10 right-0 mt-1 p-2 min-w-[200px] rounded-md bg-black border border-border'>
            <div className='flex flex-col gap-1 max-h-[300px] overflow-y-auto'>
              {balances.map((asset, i) => (
                <Button
                  key={i}
                  onClick={() => {
                    setSelection(asset);
                    setIsOpen(false);
                  }}
                  priority='secondary'
                >
                  <div className='flex items-center justify-between w-full'>
                    <Text color='text.primary'>{asset.metadata.display}</Text>
                    <Text color='text.secondary'>{asset.symbol}</Text>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </InputBlock>
  );
};
