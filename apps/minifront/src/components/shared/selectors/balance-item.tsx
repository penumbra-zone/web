import { BalanceOrMetadata, isBalance, isMetadata } from './helpers';
import { getAddressIndex } from '@penumbra-zone/getters/address-view';
import {
  getMetadataFromBalancesResponse,
  getMetadataFromBalancesResponseOptional,
} from '@penumbra-zone/getters/balances-response';
import { useMemo } from 'react';
import { DialogClose } from '@repo/ui/components/ui/dialog';
import { cn } from '@repo/ui/lib/utils';
import { AssetIcon } from '@repo/ui/components/ui/asset-icon';
import { ValueViewComponent } from '@repo/ui/components/ui/value';
import { TableCell, TableRow } from '@repo/ui/components/ui/table';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';

interface BalanceItemProps {
  asset: BalanceOrMetadata;
  value?: BalancesResponse;
  onSelect: (value: BalanceOrMetadata) => void;
}

export const BalanceItem = ({ asset, value, onSelect }: BalanceItemProps) => {
  const account = isBalance(asset) ? getAddressIndex(asset.accountAddress).account : undefined;
  const metadataFromAsset = isMetadata(asset)
    ? asset
    : getMetadataFromBalancesResponseOptional(asset);
  const metadataFromValue = getMetadataFromBalancesResponse.optional()(value);

  const isSelected = useMemo(() => {
    if (!value) return false;
    if (isBalance(asset)) return value.equals(asset);
    if (isMetadata(asset)) return metadataFromValue?.equals(metadataFromAsset);
    return false;
  }, [asset, value]);

  return (
    <DialogClose asChild onClick={() => onSelect(asset)}>
      <TableRow
        className={cn(
          'cursor-pointer hover:bg-light-brown font-bold text-muted-foreground',
          isSelected && 'bg-light-brown',
        )}
      >
        <TableCell>{account}</TableCell>

        <TableCell>
          <div className='col-span-2 flex items-center justify-start gap-1'>
            <AssetIcon metadata={metadataFromAsset} />
            <p
              title={metadataFromAsset?.symbol ? metadataFromAsset.symbol : 'Unknown asset'}
              className='max-w-20 truncate lg:max-w-60'
            >
              {metadataFromAsset?.symbol ? metadataFromAsset.symbol : 'Unknown asset'}
            </p>
          </div>
        </TableCell>

        <TableCell>
          <div className='col-span-2 flex justify-end'>
            {isBalance(asset) && (
              <ValueViewComponent showIcon={false} showDenom={false} view={asset.balanceView} />
            )}
          </div>
        </TableCell>
      </TableRow>
    </DialogClose>
  );
};
