import { observer } from 'mobx-react-lite';
import { Search } from 'lucide-react';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import {
  getAddressIndex,
  getBalanceView,
  getMetadataFromBalancesResponse,
} from '@penumbra-zone/getters/balances-response';
import { Text } from '@penumbra-zone/ui/Text';
import { Dialog } from '@penumbra-zone/ui/Dialog';
import { AssetIcon } from '@penumbra-zone/ui/AssetIcon';
import {
  groupAndSortBalances,
  AssetSelectorValue,
  isBalancesResponse,
  filterAssets as filterUnswappableAssets,
} from '@penumbra-zone/ui/AssetSelector';
import { Button } from '@penumbra-zone/ui/Button';
import { useAssets } from '@/shared/api/assets';
import { useBalances } from '@/shared/api/balances';
import { connectionStore } from '@/shared/model/connection';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { recentPairsStore } from './store';

export interface SearchResultsProps {
  onSelect: (asset: Metadata) => void;
  onClear: VoidFunction;
  search?: string;
}

const filterAsset = (asset: Metadata, search: string): boolean => {
  return (
    asset.symbol.toLowerCase().includes(search.toLowerCase()) ||
    asset.description.toLowerCase().includes(search.toLowerCase())
  );
};

const useFilteredAssets = (options: AssetSelectorValue[], search: string) => {
  return options.filter(option => {
    if (isBalancesResponse(option)) {
      const metadata = getMetadataFromBalancesResponse(option);
      return filterAsset(metadata, search);
    }
    return filterAsset(option, search);
  });
};

const mergeOptions = (
  assets: Metadata[],
  balances: BalancesResponse[],
  account: number,
): AssetSelectorValue[] => {
  const grouped = groupAndSortBalances(balances);
  const balancesPerAccount = grouped.find(group => group[0] === account.toString())?.[1] ?? [];
  const filteredAssets = filterUnswappableAssets(assets)
    .filter(
      asset =>
        !balancesPerAccount.some(
          balance => getMetadataFromBalancesResponse(balance).symbol === asset.symbol,
        ),
    )
    .sort((a, b) => Number(b.priorityScore) - Number(a.priorityScore));
  return [...balancesPerAccount, ...filteredAssets];
};

export const SearchResults = observer(({ onSelect, onClear, search }: SearchResultsProps) => {
  const { recent, add } = recentPairsStore;
  const { subaccount } = connectionStore;

  const { data: assets } = useAssets();
  const { data: balances } = useBalances(subaccount);

  const merged = mergeOptions(assets ?? [], balances ?? [], subaccount);
  const filtered = useFilteredAssets(merged, search ?? '');

  const onClick = (asset: Metadata) => {
    add(asset);
    onSelect(asset);
  };

  if (!filtered.length) {
    return (
      <div className='grow flex flex-col items-center justify-center gap-2 py-4 text-text-secondary'>
        <Search className='size-8' />
        <Text small>No results</Text>
      </div>
    );
  }

  return (
    <>
      {!search && !!recent.length && (
        <div className='flex flex-col gap-2 text-text-secondary'>
          <Text small>Recent</Text>
          <Dialog.RadioGroup>
            <div className='flex flex-col gap-1'>
              {recent.map(asset => (
                <Dialog.RadioItem
                  key={`${asset.symbol}-${asset.display}`}
                  value={`${asset.symbol}-${asset.display}`}
                  startAdornment={<AssetIcon metadata={asset} size='lg' />}
                  title={
                    <div className={asset.name ? '' : 'h-10 flex items-center'}>
                      <Text color='text.primary'>{asset.symbol}</Text>
                    </div>
                  }
                  description={
                    asset.name && (
                      <div className='-mt-2'>
                        <Text detail color='text.secondary'>
                          {asset.name}
                        </Text>
                      </div>
                    )
                  }
                  onSelect={() => onClick(asset)}
                />
              ))}
            </div>
          </Dialog.RadioGroup>
        </div>
      )}

      <div className='flex flex-col gap-2 text-text-secondary'>
        <Text small>Search results</Text>
        <Dialog.RadioGroup>
          <div className='flex flex-col gap-1'>
            {filtered.map(option => {
              const asset = isBalancesResponse(option)
                ? getMetadataFromBalancesResponse(option)
                : option;
              const balance = isBalancesResponse(option)
                ? {
                    addressIndexAccount: getAddressIndex.optional(option)?.account,
                    valueView: getBalanceView.optional(option),
                  }
                : undefined;

              return (
                <Dialog.RadioItem
                  key={`${asset.symbol}-${asset.display}`}
                  value={`${asset.symbol}-${asset.display}`}
                  startAdornment={<AssetIcon metadata={asset} size='lg' />}
                  endAdornment={
                    balance && (
                      <ValueViewComponent
                        showSymbol={false}
                        showIcon={false}
                        context='table'
                        valueView={balance.valueView}
                      />
                    )
                  }
                  title={
                    <div className={asset.name ? '' : 'h-10 flex items-center'}>
                      <Text color='text.primary'>{asset.symbol}</Text>
                    </div>
                  }
                  description={
                    asset.name && (
                      <div className='-mt-2'>
                        <Text detail color='text.secondary'>
                          {asset.name}
                        </Text>
                      </div>
                    )
                  }
                  onSelect={() => onClick(asset)}
                />
              );
            })}
          </div>
        </Dialog.RadioGroup>
      </div>

      <div className='flex flex-col gap-4 sticky bottom-0 w-full rounded-sm z-10'>
        <div className='bg-neutral-dark'>
          <Button onClick={onClear} priority='primary'>
            Clear
          </Button>
        </div>
      </div>
    </>
  );
});
