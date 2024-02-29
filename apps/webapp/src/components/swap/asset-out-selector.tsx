import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTrigger } from '@penumbra-zone/ui';
import { AssetIcon } from '@penumbra-zone/ui/components/ui/tx/view/asset-icon';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { localAssets } from '@penumbra-zone/constants';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';

interface AssetOutSelectorProps {
  balances: BalancesResponse[];
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
      <DialogContent className='max-w-[312px] bg-charcoal-secondary md:max-w-[400px]'>
        <div className='relative z-10 flex flex-col gap-4 pb-5'>
          <DialogHeader className='border-b'>Select asset</DialogHeader>
          <div className='flex flex-col gap-4 px-[30px]'>
            <div className='flex flex-col gap-2'>
              {localAssets.map(d => (
                <div key={d.display} className='flex flex-col'>
                  <DialogClose>
                    <div
                      className='grid cursor-pointer break-all py-[10px] font-bold text-muted-foreground hover:-mx-4 hover:bg-light-brown hover:px-4'
                      onClick={() => setAssetOut(d)}
                    >
                      <div className='flex justify-start gap-[6px]'>
                        <AssetIcon metadata={d} />
                        <p>{d.display}</p>
                      </div>
                    </div>
                  </DialogClose>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className='absolute inset-0 z-0 bg-card-radial opacity-20' />
      </DialogContent>
    </Dialog>
  );
};
