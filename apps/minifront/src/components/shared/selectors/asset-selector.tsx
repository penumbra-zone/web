import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
} from '@penumbra-zone/ui-deprecated/components/ui/dialog';
import { AssetIcon } from '@penumbra-zone/ui-deprecated/components/ui/asset-icon';
import { Metadata, ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { ValueViewComponent } from '@penumbra-zone/ui-deprecated/components/ui/value';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { IconInput } from '@penumbra-zone/ui-deprecated/components/ui/icon-input';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { Box } from '@penumbra-zone/ui-deprecated/components/ui/box';
import { motion } from 'framer-motion';
import { metadataBySearch } from './search-filters';
import { cn } from '@penumbra-zone/ui-deprecated/lib/utils';
import { LoadingIndicator } from './loading-indicator';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@penumbra-zone/ui-deprecated/components/ui/table';

interface AssetSelectorProps {
  assets: Metadata[];
  value?: Metadata;
  loading?: boolean;
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
  if (!filter || !value) {
    return;
  }

  if (!filter(value)) {
    const firstAssetThatPassesTheFilter = assets.find(filter);
    if (firstAssetThatPassesTheFilter) {
      onChange(firstAssetThatPassesTheFilter);
    }
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
  filteredAssets = search ? assets.filter(metadataBySearch(search)) : assets;

  useEffect(
    () => switchAssetIfNecessary({ value, onChange, filter, assets: filteredAssets }),
    [filter, value, filteredAssets, onChange],
  );

  return { filteredAssets, search, setSearch };
};

/**
 * Allows the user to select any asset known to Penumbra, optionally filtered by
 * a filter function.
 *
 * For an asset selector that picks from the user's balances, use
 * `<BalanceSelector />`.
 */
export const AssetSelector = ({ assets, loading, onChange, value, filter }: AssetSelectorProps) => {
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

  const isSelected = useCallback(
    (metadata: Metadata) => {
      return value?.equals(metadata);
    },
    [value],
  );

  return (
    <>
      {!isOpen && (
        <motion.div
          layout
          layoutId={layoutId}
          className={cn(
            'flex min-w-[100px] max-w-[200px] cursor-pointer items-center justify-center rounded-lg px-2',
            !loading && 'bg-light-brown',
          )}
          onClick={() => setIsOpen(true)}
        >
          {loading ? (
            <LoadingIndicator />
          ) : (
            <ValueViewComponent view={valueView} showValue={false} />
          )}
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
          <div className='flex max-h-[90dvh] flex-col'>
            <DialogHeader>Select asset</DialogHeader>

            <div className='flex flex-col gap-2 overflow-auto'>
              <div className='px-4 pt-4'>
                <Box spacing='compact'>
                  <IconInput
                    icon={<MagnifyingGlassIcon className='size-5 text-muted-foreground' />}
                    value={search}
                    onChange={setSearch}
                    autoFocus
                    placeholder='Search assets...'
                  />
                </Box>
              </div>

              <Table>
                <TableBody>
                  {filteredAssets.map(metadata => (
                    <DialogClose asChild key={metadata.display}>
                      <TableRow
                        className='cursor-pointer justify-start overflow-hidden font-bold text-muted-foreground'
                        onClick={() => onChange(metadata)}
                        role='button'
                      >
                        <TableCell className='p-0'>
                          <div
                            className={cn(
                              'flex h-full gap-[6px] p-4 hover:bg-light-brown',
                              isSelected(metadata) && 'bg-light-brown',
                            )}
                          >
                            <AssetIcon metadata={metadata} />
                            <p className='truncate'>{metadata.symbol || 'Unknown asset'}</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    </DialogClose>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
