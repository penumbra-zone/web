import { BalanceOrMetadata, isBalance, isMetadata } from './helpers';
import { getAddressIndex } from '@penumbra-zone/getters/address-view';
import { getMetadataFromBalancesResponseOptional } from '@penumbra-zone/getters/balances-response';
import { useMemo } from 'react';
import { DialogClose } from '@repo/ui/components/ui/dialog';
import { cn } from '@repo/ui/lib/utils';
import { AssetIcon } from '@repo/ui/components/ui/tx/view/asset-icon';
import { ValueViewComponent } from '@repo/ui/components/ui/tx/view/value';

interface BalanceItemProps {
  asset: BalanceOrMetadata;
  value?: BalanceOrMetadata;
  onSelect: (value: BalanceOrMetadata) => void;
}

export const BalanceItem = ({ asset, value, onSelect }: BalanceItemProps) => {
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
            'grid grid-cols-5 py-[10px] gap-3 cursor-pointer hover:bg-light-brown hover:px-4 hover:-mx-4 font-bold text-muted-foreground',
            isSelected && 'bg-light-brown px-4 -mx-4',
          )}
        >
          {metadata && (
            <div className='col-span-2 flex items-center justify-start gap-1'>
              <AssetIcon metadata={metadata} />
              <p className='truncate'>{metadata.symbol || 'Unknown asset'}</p>
            </div>
          )}

          <div className='col-span-2 flex justify-end'>
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
