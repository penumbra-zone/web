import cn from 'clsx';
import { Search, X } from 'lucide-react';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { AssetIcon } from '@penumbra-zone/ui/AssetIcon';
import { Text } from '@penumbra-zone/ui/Text';
import { Button } from '@penumbra-zone/ui/Button';
import { TextInput } from '@penumbra-zone/ui/TextInput';
import { Density } from '@penumbra-zone/ui/Density';

export interface FilterInputProps {
  asset?: Metadata;
  onClear: VoidFunction;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}

export const FilterInput = ({
  ref,
  asset,
  onClear,
  onChange,
  value,
  placeholder,
}: FilterInputProps & {
  ref: React.RefObject<HTMLInputElement>;
}) => {
  const deselect = () => {
    onChange('');
    onClear();
  };

  return (
    <>
      {asset && (
        <div
          className={cn(
            'grow h-14 flex gap-2 items-center text-text-primary px-3 rounded-sm bg-other-tonalFill5',
          )}
        >
          <div className='grow flex items-center gap-2 max-w-[calc(100%_-_32px)]'>
            <AssetIcon metadata={asset} />
            <Text truncate>{asset.symbol}</Text>
          </div>
          <Density compact>
            <Button iconOnly='adornment' icon={X} onClick={deselect}>
              Deselect asset
            </Button>
          </Density>
        </div>
      )}

      <div className={cn(asset && 'hidden')}>
        <TextInput
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          endAdornment={<Search />}
          ref={ref}
        />
      </div>
    </>
  );
};
FilterInput.displayName = 'FilterInput';
