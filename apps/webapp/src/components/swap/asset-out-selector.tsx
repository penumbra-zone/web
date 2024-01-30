import { AssetBalance } from '../../fetchers/balances';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTrigger } from '@penumbra-zone/ui';
import { AssetIcon } from '../shared/asset-icon';
import { assets } from '@penumbra-zone/constants/assets';
import { Asset } from '@penumbra-zone/types';

interface AssetOutSelectorProps {
  balances: AssetBalance[];
  assetOut: Asset | undefined;
  setAssetOut: (asset: Asset) => void;
}

export const AssetOutSelector = ({ balances, setAssetOut, assetOut }: AssetOutSelectorProps) => {
  return (
    <Dialog>
      <DialogTrigger disabled={!balances.length}>
        <div className='flex h-9 min-w-[100px] items-center justify-center gap-2 rounded-lg bg-light-brown px-2'>
          {assetOut?.display && <AssetIcon name={assetOut.display} />}
          <p className='font-bold text-light-grey md:text-sm xl:text-base'>{assetOut?.display}</p>
        </div>
      </DialogTrigger>
      <DialogContent className='max-w-[312px] bg-charcoal-secondary md:max-w-[400px]'>
        <div className='relative z-10 flex flex-col gap-4 pb-5'>
          <DialogHeader className='border-b'>Select asset</DialogHeader>
          <div className='flex flex-col gap-4 px-[30px]'>
            <div className='flex flex-col gap-2'>
              {assets.map(a => (
                <div key={a.display} className='flex flex-col'>
                  <DialogClose>
                    <div
                      className='grid cursor-pointer grid-cols-3 py-[10px] font-bold text-muted-foreground hover:-mx-4 hover:bg-light-brown hover:px-4'
                      onClick={() => setAssetOut(a)}
                    >
                      <div className='flex justify-start gap-[6px]'>
                        <AssetIcon name={a.display} />
                        <p>{a.display}</p>
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
