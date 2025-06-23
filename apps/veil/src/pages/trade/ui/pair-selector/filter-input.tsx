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
  ref?: React.RefObject<HTMLInputElement | null>;
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
            'flex h-14 grow items-center gap-2 rounded-sm bg-other-tonal-fill5 px-3 text-text-primary',
          )}
        >
          <div className='flex max-w-[calc(100%-32px)] grow items-center gap-2'>
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
