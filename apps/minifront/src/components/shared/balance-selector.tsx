import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { useId, useMemo, useState } from 'react';
import { IconInput } from '@repo/ui/components/ui/icon-input';
import { Dialog, DialogClose, DialogContent, DialogHeader } from '@repo/ui/components/ui/dialog';
import { cn } from '@repo/ui/lib/utils';
import { ValueViewComponent } from '@repo/ui/components/ui/tx/view/value';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { getAddressIndex } from '@penumbra-zone/getters/address-view';
import { getDisplayDenomFromView, getSymbolFromValueView } from '@penumbra-zone/getters/value-view';
import { Box } from '@repo/ui/components/ui/box';
import { motion } from 'framer-motion';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { filterMetadataBySearch } from './asset-selector';
import { getMetadataFromBalancesResponseOptional } from '@penumbra-zone/getters/balances-response';
import { AssetIcon } from '@repo/ui/components/ui/tx/view/asset-icon';
import { emptyBalanceResponse } from '../../utils/empty-balance-response';
import { isKnown } from '../swap/helpers';

const isMetadata = (asset: BalancesResponse | Metadata): asset is Metadata => {
  return Boolean('symbol' in asset && 'name' in asset && 'display' in asset);
};

const isBalance = (asset: BalancesResponse | Metadata): asset is BalancesResponse => {
  return 'balanceView' in asset && 'accountAddress' in asset;
};

const filterBalanceBySearch = (search: string) => (balancesResponse: BalancesResponse) =>
  isKnown(balancesResponse) &&
  (getDisplayDenomFromView(balancesResponse.balanceView)
    .toLocaleLowerCase()
    .includes(search.toLocaleLowerCase()) ||
    getSymbolFromValueView(balancesResponse.balanceView)
      .toLocaleLowerCase()
      .includes(search.toLocaleLowerCase()));

const bySearch = (search: string) => (asset: Metadata | BalancesResponse) => {
  if (isMetadata(asset)) {
    return filterMetadataBySearch(search)(asset);
  }
  if (isBalance(asset)) return filterBalanceBySearch(search)(asset);
  return false;
};

const mergeBalancesAndAssets = (balances: BalancesResponse[] = [], assets: Metadata[] = []) => {
  const filteredAssets = assets.filter(asset => {
    return !balances.some(balance => {
      const balanceMetadata = getMetadataFromBalancesResponseOptional(balance);
      return balanceMetadata?.equals(asset);
    });
  });
  return [...balances, ...filteredAssets];
};

interface BalanceItemProps {
  asset: BalancesResponse | Metadata;
  value?: BalancesResponse | Metadata;
  onSelect: (value: BalancesResponse | Metadata) => void;
}

const BalanceItem = ({ asset, value, onSelect }: BalanceItemProps) => {
  const account = isBalance(asset) ? getAddressIndex(asset.accountAddress).account : undefined;
  const metadata = isMetadata(asset) ? asset : getMetadataFromBalancesResponseOptional(asset);

  const isSelected = useMemo(() => {
    if (!value) return false;
    if (isMetadata(value) && isMetadata(asset)) {
      return value.equals(asset);
    }
    if (isBalance(value) && isBalance(asset)) {
      return value.equals(asset);
    }
    return false;
  }, [asset, value]);

  return (
    <div className='flex flex-col'>
      <DialogClose onClick={() => onSelect(asset)}>
        <div
          className={cn(
            'grid grid-cols-4 py-[10px] gap-3 cursor-pointer hover:bg-light-brown hover:px-4 hover:-mx-4 font-bold text-muted-foreground',
            isSelected && 'bg-light-brown px-4 -mx-4',
          )}
        >
          {metadata && (
            <div className='col-span-2 flex items-center justify-start gap-1'>
              <AssetIcon metadata={metadata} />
              <p className='truncate'>{metadata.symbol || 'Unknown asset'}</p>
            </div>
          )}

          <div className='flex justify-end'>
            {isBalance(asset) && (
              <ValueViewComponent showIcon={false} showDenom={false} view={asset.balanceView} />
            )}
          </div>

          <p className='flex justify-center'>{account}</p>
        </div>
      </DialogClose>
    </div>
  );
};

interface BalanceSelectorProps {
  value: BalancesResponse | undefined;
  onChange: (selection: BalancesResponse) => void;
  balances?: BalancesResponse[];
  assets?: Metadata[];
}

/**
 * Renders balances the user holds, and allows the user to select one. This is
 * useful for a form where the user wants to send/sell/swap an asset that they
 * already hold.
 *
 * Use `<AssetSelector />` if you want to render assets that aren't tied to any
 * balance.
 */
export default function BalanceSelector({
  value,
  balances,
  onChange,
  assets,
}: BalanceSelectorProps) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const layoutId = useId();

  const allAssets = mergeBalancesAndAssets(balances, assets);
  const filteredBalances = search ? allAssets.filter(bySearch(search)) : allAssets;

  const onSelect = (asset: BalancesResponse | Metadata) => {
    if (!isMetadata(asset)) {
      onChange(asset);
      return;
    }
    onChange(emptyBalanceResponse(asset));
  };

  return (
    <>
      {!isOpen && (
        <motion.div
          layout
          layoutId={layoutId}
          className='flex min-w-[100px] max-w-[200px] cursor-pointer items-center justify-center rounded-lg bg-light-brown px-2'
          onClick={() => setIsOpen(true)}
        >
          <ValueViewComponent view={value?.balanceView} showValue={false} />
        </motion.div>
      )}

      {isOpen && (
        <>
          {/* 0-opacity placeholder for layout's sake */}
          <div className='flex min-w-[100px] max-w-[200px] px-2 opacity-0'>
            <ValueViewComponent view={value?.balanceView} showValue={false} />
          </div>
        </>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent layoutId={layoutId}>
          <div className='flex max-h-[90dvh] flex-col'>
            <DialogHeader>Select asset</DialogHeader>
            <div className='flex shrink flex-col gap-4 overflow-auto p-4'>
              <Box spacing='compact'>
                <IconInput
                  icon={<MagnifyingGlassIcon className='size-5 text-muted-foreground' />}
                  value={search}
                  onChange={setSearch}
                  autoFocus
                  placeholder='Search assets...'
                />
              </Box>
              <div className='mt-2 grid grid-cols-4 gap-3 font-headline text-base font-semibold'>
                <p className='col-span-2 flex justify-start'>Asset</p>
                <p className='flex justify-end'>Balance</p>
                <p className='flex justify-center'>Account</p>
              </div>
              <div className='flex flex-col gap-2'>
                {filteredBalances.map((asset, i) => (
                  <BalanceItem key={i} asset={asset} value={value} onSelect={onSelect} />
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
