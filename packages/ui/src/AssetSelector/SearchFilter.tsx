import { Search } from 'lucide-react';
import { Icon } from '../Icon';
import { TextInput } from '../TextInput';

export interface AssetSelectorSearchFilterProps {
  value?: string;
  onChange?: (newValue: string) => void;
}

export const AssetSelectorSearchFilter = ({ value, onChange }: AssetSelectorSearchFilterProps) => {
  const handleSearch = (newValue: string) => onChange?.(newValue);

  return (
    <TextInput
      startAdornment={<Icon size='sm' IconComponent={Search} color='text.primary' />}
      value={value ?? ''}
      onChange={handleSearch}
      placeholder='Search...'
    />
  );
};
