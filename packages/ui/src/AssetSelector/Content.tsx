import styled from 'styled-components';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { RadioGroup } from '@radix-ui/react-radio-group';
import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { isBalancesResponse, isMetadata, getHash } from './utils/helpers.ts';
import { Dialog } from '../Dialog';
import { TextInput } from '../TextInput';
import { Icon } from '../Icon';
import { filterMetadataOrBalancesResponseByText } from './utils/filterMetadataOrBalancesResponseByText.ts';
import { IsAnimatingProvider } from '../IsAnimatingProvider';
import { ListItem } from './ListItem.tsx';
import { uint8ArrayToHex } from '@penumbra-zone/types/hex';
import { ActionType } from '../utils/ActionType.ts';

const isEqual = (
  value1: BalancesResponse | Metadata,
  value2: BalancesResponse | Metadata | undefined,
) => {
  if (isMetadata(value1)) {
    return isMetadata(value2) && value1.equals(value2);
  }

  return isBalancesResponse(value2) && value1.equals(value2);
};

const OptionsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing(1)};
`;

export interface AssetSelectorDialogContentProps<
  ValueType extends (BalancesResponse | Metadata) | Metadata,
> {
  title: string;
  layoutId: string;
  value?: ValueType;
  onChange: (value: ValueType) => void;
  options: ValueType[];
  actionType?: ActionType;
  onClose?: VoidFunction;
}

export const AssetSelectorContent = <ValueType extends (BalancesResponse | Metadata) | Metadata>({
  title,
  layoutId,
  value,
  onChange,
  options,
  actionType = 'default',
  onClose,
}: AssetSelectorDialogContentProps<ValueType>) => {
  const [search, setSearch] = useState('');
  const filteredOptions = useMemo(
    () => options.filter(filterMetadataOrBalancesResponseByText(search)),
    [search, options],
  );

  const onValueChange = (hash: string) => {
    const newValue = options.find(option => getHash(option) === hash);
    if (newValue) {
      onChange(newValue);
    }
  };

  return (
    <IsAnimatingProvider>
      {props => (
        <Dialog.Content title={title} motion={{ ...props, layoutId }} key={layoutId}>
          <TextInput
            startAdornment={
              <Icon size='sm' IconComponent={Search} color={color => color.text.primary} />
            }
            value={search}
            onChange={setSearch}
            placeholder='Search...'
          />

          <RadioGroup asChild onValueChange={onValueChange}>
            <OptionsWrapper>
              {filteredOptions.map(option => (
                <ListItem
                  value={option}
                  key={uint8ArrayToHex(option.toBinary())}
                  isSelected={isEqual(option, value)}
                  actionType={actionType}
                  onClose={onClose}
                />
              ))}
            </OptionsWrapper>
          </RadioGroup>
        </Dialog.Content>
      )}
    </IsAnimatingProvider>
  );
};
