import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '@penumbra-zone/ui/components/ui/dialog';
import { AssetIcon } from '@penumbra-zone/ui/components/ui/tx/view/asset-icon';
import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { localAssets } from '@penumbra-zone/constants/src/assets';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { ValueViewComponent } from '@penumbra-zone/ui/components/ui/tx/view/value';

interface AssetOutSelectorProps {
  balances: BalancesResponse[];
  assetOut: ValueView | undefined;
  setAssetOut: (metadata: Metadata) => void;
}

/** @todo Refactor to use `SelectTokenModal` */
export const AssetOutSelector = ({ balances, setAssetOut, assetOut }: AssetOutSelectorProps) => {
  return (
    <Dialog>
      <DialogTrigger disabled={!balances.length}>
        <div className='flex h-9 min-w-[100px] max-w-[150px] items-center justify-center gap-2 rounded-lg bg-light-brown px-2'>
          <ValueViewComponent view={assetOut} showValue={false} showEquivalent={false} />
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>Select asset</DialogHeader>
        <div className='flex flex-col gap-2 overflow-hidden px-[30px]'>
          {localAssets.map(d => (
            <div key={d.display} className='flex flex-col'>
              <DialogClose>
                <div
                  className={
                    'flex cursor-pointer justify-start gap-[6px] overflow-hidden py-[10px] font-bold text-muted-foreground hover:-mx-4 hover:bg-light-brown hover:px-4'
                  }
                  onClick={() => setAssetOut(d)}
                >
                  <AssetIcon metadata={d} />
                  <p className='truncate'>{d.display}</p>
                </div>
              </DialogClose>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
