import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { Dialog } from '../../Dialog';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { MetadataOrBalancesResponse } from './MetadataOrBalancesResponse';
import { isBalancesResponse, isMetadata } from '../helpers';
import { getAssetId } from '@penumbra-zone/getters/metadata';
import { bech32mAssetId } from '@penumbra-zone/bech32m/passet';
import {
  getAddressIndex,
  getAssetIdFromBalancesResponse,
} from '@penumbra-zone/getters/balances-response';
import styled from 'styled-components';
import { TextInput } from '../../TextInput';
import { Icon } from '../../Icon';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { filterMetadataOrBalancesResponseByText } from '../filterMetadataOrBalancesResponseByText';
import { IsAnimatingProvider } from '../../IsAnimatingProvider';

const isEqual = (
  value1: BalancesResponse | Metadata,
  value2: BalancesResponse | Metadata | undefined,
) => {
  if (isMetadata(value1)) {
    return isMetadata(value2) && value1.equals(value2);
  }

  return isBalancesResponse(value2) && value1.equals(value2);
};

const getKey = (option: BalancesResponse | Metadata): string => {
  if (isMetadata(option)) {
    return bech32mAssetId(getAssetId(option));
  }

  const assetId = getAssetIdFromBalancesResponse(option);
  const addressIndexAccount = getAddressIndex(option).account;

  return `${addressIndexAccount}.${bech32mAssetId(assetId)}`;
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
}

export const AssetSelectorDialogContent = <
  ValueType extends (BalancesResponse | Metadata) | Metadata,
>({
  title,
  layoutId,
  value,
  onChange,
  options,
}: AssetSelectorDialogContentProps<ValueType>) => {
  const [search, setSearch] = useState('');
  const filteredOptions = useMemo(
    () => options.filter(filterMetadataOrBalancesResponseByText(search)),
    [search, options],
  );

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

          <OptionsWrapper>
            {filteredOptions.map(option => (
              <MetadataOrBalancesResponse
                key={getKey(option)}
                value={option}
                isSelected={isEqual(option, value)}
                onSelect={() => onChange(option)}
              />
            ))}
          </OptionsWrapper>
        </Dialog.Content>
      )}
    </IsAnimatingProvider>
  );
};
