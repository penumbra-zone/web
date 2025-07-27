import { useMemo, useState } from 'react';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';

import { isBalancesResponse, isMetadata } from './shared/helpers';
import { filterMetadataOrBalancesResponseByText } from './shared/filterMetadataOrBalancesResponseByText';
import { AssetSelectorBaseProps, AssetSelectorValue } from './shared/types';
import { AssetSelectorCustom, AssetSelectorCustomProps } from './Custom';
import { Item, AssetSelectorItemProps } from './SelectItem';
import { Text } from '../Text';
import { filterAssets, groupAndSortBalances } from './shared/groupAndSort';

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
 *         <AssetSelector.Item key={getKeyHash(option)} value={option} />
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
      filteredAssets: filterAssets(assets).filter(filterMetadataOrBalancesResponseByText(search)),
      filteredBalances: groupAndSortBalances(
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
        <div className='flex flex-col gap-4'>
          {!!filteredBalances.length && (
            <Text small color='text.secondary'>
              Your Tokens
            </Text>
          )}

          {filteredBalances.map(([account, balances]) => (
            <div key={account} className='flex flex-col gap-1'>
              {balances.map(balance => (
                <Item key={getKeyHash(balance)} value={balance} />
              ))}
            </div>
          ))}
          {!!filteredAssets.length && (
            <Text small color='text.secondary'>
              All Tokens
            </Text>
          )}
          <div className='mt-2 flex flex-col gap-1'>
            {filteredAssets.map(asset => (
              <Item key={getKeyHash(asset)} value={asset} />
            ))}
          </div>
        </div>
      )}
    </AssetSelectorCustom>
  );
};

AssetSelector.Custom = AssetSelectorCustom;
AssetSelector.Item = Item;

export { isBalancesResponse, isMetadata, groupAndSortBalances, filterAssets };

export type { AssetSelectorValue, AssetSelectorCustomProps, AssetSelectorItemProps };
