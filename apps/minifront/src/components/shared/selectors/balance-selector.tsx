import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { useId, useState } from 'react';
import { IconInput } from '@repo/ui/components/ui/icon-input';
import { Dialog, DialogContent, DialogHeader } from '@repo/ui/components/ui/dialog';
import { ValueViewComponent } from '@repo/ui/components/ui/value';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb.js';
import { Box } from '@repo/ui/components/ui/box';
import { motion } from 'framer-motion';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb.js';
import { emptyBalanceResponse } from '../../../utils/empty-balance-response';
import { bySearch } from './search-filters';
import {
  BalanceOrMetadata,
  isMetadata,
  mergeBalancesAndAssets,
  useSyncSelectedBalance,
} from './helpers';
import { BalanceItem } from './balance-item';
import { cn } from '@repo/ui/lib/utils';
import { LoadingIndicator } from './loading-indicator';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@repo/ui/components/ui/table';

interface BalanceSelectorProps {
  value: BalancesResponse | undefined;
  loading?: boolean;
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
  loading,
  balances,
  onChange,
  assets,
}: BalanceSelectorProps) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const layoutId = useId();

  const allAssets = mergeBalancesAndAssets(balances, assets);
  const filteredBalances = search ? allAssets.filter(bySearch(search)) : allAssets;
  useSyncSelectedBalance({ balances, value, onChange });

  const onSelect = (asset: BalanceOrMetadata) => {
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
          className={cn(
            'flex min-w-[100px] max-w-[200px] cursor-pointer items-center justify-center rounded-lg px-2',
            !loading && 'bg-light-brown',
          )}
          onClick={() => setIsOpen(true)}
        >
          {loading ? (
            <LoadingIndicator />
          ) : (
            <ValueViewComponent view={value?.balanceView} showValue={false} />
          )}
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead>Asset</TableHead>
                    <TableHead className='text-right'>Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBalances.map((asset, i) => (
                    <BalanceItem key={i} asset={asset} value={value} onSelect={onSelect} />
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
