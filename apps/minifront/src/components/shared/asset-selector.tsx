import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
} from '@penumbra-zone/ui/components/ui/dialog';
import { AssetIcon } from '@penumbra-zone/ui/components/ui/asset-icon';
import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { ValueViewComponent } from '@penumbra-zone/ui/components/ui/value';
import { useEffect, useId, useMemo, useState } from 'react';
import { IconInput } from '@penumbra-zone/ui/components/ui/icon-input';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { Box } from '@penumbra-zone/ui/components/ui/box';
import { motion } from 'framer-motion';

interface AssetSelectorProps {
  assets: Metadata[];
  value?: Metadata;
  onChange: (metadata: Metadata) => void;
  /**
   * If passed, this function will be called for every asset that
   * `AssetSelector` plans to display. It should return `true` or `false`
   * depending on whether that asset should be displayed.
   */
  filter?: (metadata: Metadata) => boolean;
}

/**
 * If the `filter` rejects the currently selected `asset`, switch to a different
 * `asset`.
 */
const switchAssetIfNecessary = ({
  value,
  onChange,
  filter,
  assets,
}: AssetSelectorProps & { assets: Metadata[] }) => {
  if (!filter || !value) return;

  if (!filter(value)) {
    const firstAssetThatPassesTheFilter = assets.find(filter);
    if (firstAssetThatPassesTheFilter) onChange(firstAssetThatPassesTheFilter);
  }
};

const useFilteredAssets = ({ assets, value, onChange, filter }: AssetSelectorProps) => {
  const sortedAssets = useMemo(
    () =>
      [...assets].sort((a, b) =>
        a.symbol.toLocaleLowerCase() < b.symbol.toLocaleLowerCase() ? -1 : 1,
      ),
    [assets],
  );

  const [search, setSearch] = useState('');

  let filteredAssets = filter ? sortedAssets.filter(filter) : sortedAssets;
  filteredAssets = search ? assets.filter(bySearch(search)) : assets;

  useEffect(
    () => switchAssetIfNecessary({ value, onChange, filter, assets: filteredAssets }),
    [filter, value, filteredAssets, onChange],
  );

  return { filteredAssets, search, setSearch };
};

const bySearch = (search: string) => (asset: Metadata) =>
  asset.display.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
  asset.symbol.toLocaleLowerCase().includes(search.toLocaleLowerCase());

/**
 * Allows the user to select any asset known to Penumbra, optionally filtered by
 * a filter function.
 *
 * For an asset selector that picks from the user's balances, use
 * `<BalanceSelector />`.
 */
export const AssetSelector = ({ assets, onChange, value, filter }: AssetSelectorProps) => {
  const { filteredAssets, search, setSearch } = useFilteredAssets({
    assets,
    value,
    onChange,
    filter,
  });

  const layoutId = useId();
  const [isOpen, setIsOpen] = useState(false);

  /**
   * @todo: Refactor to not use `ValueViewComponent`, since it's not intended to
   * just display an asset icon/symbol without a value.
   */
  const valueView = useMemo(
    () => new ValueView({ valueView: { case: 'knownAssetId', value: { metadata: value } } }),
    [value],
  );

  return (
    <>
      {!isOpen && (
        <motion.div
          layout
          layoutId={layoutId}
          className='flex min-w-[100px] max-w-[200px] cursor-pointer items-center justify-center rounded-lg bg-light-brown px-2'
          onClick={() => setIsOpen(true)}
        >
          <ValueViewComponent view={valueView} showValue={false} />
        </motion.div>
      )}

      {isOpen && (
        <>
          {/* 0-opacity placeholder for layout's sake */}
          <div className='flex min-w-[100px] max-w-[200px] px-2 opacity-0'>
            <ValueViewComponent view={valueView} showValue={false} />
          </div>
        </>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent layoutId={layoutId}>
          <div className='flex max-h-screen flex-col'>
            <DialogHeader>Select asset</DialogHeader>

            <div className='flex flex-col gap-2 overflow-auto p-4'>
              <Box spacing='compact'>
                <IconInput
                  icon={<MagnifyingGlassIcon className='size-5 text-muted-foreground' />}
                  value={search}
                  onChange={setSearch}
                  placeholder='Search assets...'
                />
              </Box>

              {filteredAssets.map(metadata => (
                <div key={metadata.display} className='flex flex-col'>
                  <DialogClose>
                    <div
                      className={
                        'flex cursor-pointer justify-start gap-[6px] overflow-hidden py-[10px] font-bold text-muted-foreground hover:-mx-4 hover:bg-light-brown hover:px-4'
                      }
                      onClick={() => onChange(metadata)}
                    >
                      <AssetIcon metadata={metadata} />
                      <p className='truncate'>{metadata.symbol || 'Unknown asset'}</p>
                    </div>
                  </DialogClose>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
