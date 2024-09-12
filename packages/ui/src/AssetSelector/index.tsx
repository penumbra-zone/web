import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';

import { isBalancesResponse, isMetadata } from './shared/helpers.ts';
import { filterMetadataOrBalancesResponseByText } from './shared/filterMetadataOrBalancesResponseByText.ts';
import { AssetSelectorBaseProps, AssetSelectorValue } from './shared/types.ts';
import { AssetSelectorCustom, AssetSelectorCustomProps } from './Custom.tsx';
import { ListItem, ListItemProps } from './ListItem.tsx';
import { Text } from '../Text';
import { groupAndSort } from './shared/groupAndSort.ts';

const ListItemGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing(1)};
`;

const SelectorList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing(4)};
`;

export interface AssetSelectorProps extends AssetSelectorBaseProps {
  /**
   * An array of `Metadata` – protobuf message types describing the asset:
   * its name, symbol, id, icons, and more
   */
  assets?: Metadata[];
  /**
   * An array of `BalancesResponse` – protobuf message types describing the balance of an asset:
   * the account containing the asset, the value of this asset and its description (has `Metadata` inside it)
   */
  balances?: BalancesResponse[];
}

/**
 * Allows users to choose an asset for e.g., the swap and send forms. Note that
 * it can render an array of just `Metadata`s, or a mixed array of
 * both `Metadata`s and `BalancesResponse`s. The latter is useful for e.g.,
 * letting the user estimate a swap of an asset they don't hold.
 *
 * The component has two ways of using it:
 *
 * ### 1.
 *
 * A default way with pre-defined grouping, sorting, searching and rendering algorithms. Renders the list of balances on top of the dialog with account index grouping and priority sorting within each group. When searching, it filters the assets by name, symbol, display name and base name.
 *
 * Example:
 *
 * ```tsx
 * const [value, setValue] = useState();
 *
 * <AssetSelector
 *   assets={[...]}
 *   balances={[...]}
 *   value={value}
 *   onChange={setValue}
 * />
 * ```
 *
 * ### 2.
 *
 * A custom way. You can use the `AssetSelector.Custom` with `AssetSelector.ListItem` to render the options of the selector. It is up to the consumer to sort or group the options however they want.
 *
 * Example:
 *
 * ```tsx
 * const [value, setValue] = useState<Metadata | BalancesResponse>();
 * const [search, setSearch] = useState('');
 *
 * const filteredOptions = useMemo(
 *   () => mixedOptions.filter(filterMetadataOrBalancesResponseByText(search)),
 *   [search],
 * );
 *
 * return (
 *   <AssetSelector.Custom
 *     value={value}
 *     search={search}
 *     onChange={setValue}
 *     onSearchChange={setSearch}
 *   >
 *     {({ getKeyHash }) =>
 *       filteredOptions.map(option => (
 *         <AssetSelector.ListItem key={getKeyHash(option)} value={option} />
 *       ))
 *     }
 *   </AssetSelector>
 * );
 * ```
 */
export const AssetSelector = ({
  assets = [],
  balances = [],
  value,
  onChange,
  dialogTitle = 'Select Asset',
  actionType,
  disabled,
}: AssetSelectorProps) => {
  const [search, setSearch] = useState('');

  const { filteredAssets, filteredBalances } = useMemo(
    () => ({
      filteredAssets: assets.filter(filterMetadataOrBalancesResponseByText(search)),
      filteredBalances: groupAndSort(
        balances.filter(filterMetadataOrBalancesResponseByText(search)),
      ),
    }),
    [assets, balances, search],
  );

  return (
    <AssetSelectorCustom
      value={value}
      search={search}
      dialogTitle={dialogTitle}
      actionType={actionType}
      disabled={disabled}
      onSearchChange={setSearch}
      onChange={onChange}
    >
      {({ getKeyHash }) => (
        <SelectorList>
          {!!filteredBalances.length && (
            <Text small color={color => color.text.secondary}>
              Your Tokens
            </Text>
          )}

          {filteredBalances.map(([account, balances]) => (
            <ListItemGroup key={account}>
              {balances.map(balance => (
                <ListItem key={getKeyHash(balance)} value={balance} />
              ))}
            </ListItemGroup>
          ))}

          {!!filteredAssets.length && (
            <Text small color={color => color.text.secondary}>
              All Tokens
            </Text>
          )}

          {filteredAssets.map(asset => (
            <ListItem key={getKeyHash(asset)} value={asset} />
          ))}
        </SelectorList>
      )}
    </AssetSelectorCustom>
  );
};

AssetSelector.Custom = AssetSelectorCustom;
AssetSelector.ListItem = ListItem;

export { isBalancesResponse, isMetadata };

export type { AssetSelectorValue, AssetSelectorCustomProps, ListItemProps };
