import { AssetBalance } from '../../fetchers/balances';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTrigger } from '@penumbra-zone/ui';
import { AssetIcon } from '@penumbra-zone/ui/components/ui/tx/view/asset-icon';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { localAssets } from '@penumbra-zone/constants';

interface AssetOutSelectorProps {
  balances: AssetBalance[];
  assetOut: Metadata | undefined;
  setAssetOut: (metadata: Metadata) => void;
}

/** @todo Refactor to use `SelectTokenModal` */
export const AssetOutSelector = ({ balances, setAssetOut, assetOut }: AssetOutSelectorProps) => {
  return (
    <Dialog>
      <DialogTrigger disabled={!balances.length}>
        <div className='flex h-9 min-w-[100px] max-w-[150px] items-center justify-center gap-2 rounded-lg bg-light-brown px-2'>
          {assetOut?.display && <AssetIcon metadata={assetOut} />}
          <p className='truncate font-bold text-light-grey md:text-sm xl:text-base'>
            {assetOut?.display}
          </p>
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
