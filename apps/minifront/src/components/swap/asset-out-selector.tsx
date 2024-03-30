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
import { ValueViewComponent } from '@penumbra-zone/ui/components/ui/tx/view/value';
import { useEffect } from 'react';
import { getMetadata } from '@penumbra-zone/getters/src/value-view';

interface AssetOutSelectorProps {
  assetOut: ValueView | undefined;
  setAssetOut: (metadata: Metadata) => void;
  /**
   * If passed, this function will be called for every asset that
   * `AssetOutSelector` plans to display. It should return `true` or `false`
   * depending on whether that asset should be displayed.
   */
  filter?: (metadata: Metadata) => boolean;
}

const sortedAssets = [...localAssets].sort((a, b) => (a.symbol < b.symbol ? -1 : 1));

/**
 * If the `filter` rejects the currently selected `assetOut`, switch to a
 * different `assetOut`.
 */
const switchAssetOutIfNecessary = ({
  assetOut,
  setAssetOut,
  filter,
  assets,
}: AssetOutSelectorProps & { assets: Metadata[] }) => {
  if (!filter) return;

  const assetOutMetadata = getMetadata(assetOut);

  if (!filter(assetOutMetadata)) {
    const firstAssetThatPassesTheFilter = assets.find(filter);
    if (firstAssetThatPassesTheFilter) setAssetOut(firstAssetThatPassesTheFilter);
  }
};

const useFilteredAssets = ({ assetOut, setAssetOut, filter }: AssetOutSelectorProps) => {
  const assets = filter ? sortedAssets.filter(filter) : sortedAssets;

  useEffect(
    () => switchAssetOutIfNecessary({ assetOut, setAssetOut, filter, assets }),
    [filter, assetOut, assets, setAssetOut],
  );

  return assets;
};

/** @todo Refactor to use `SelectTokenModal` */
export const AssetOutSelector = ({ setAssetOut, assetOut, filter }: AssetOutSelectorProps) => {
  const assets = useFilteredAssets({ assetOut, setAssetOut, filter });

  return (
    <Dialog>
      <DialogTrigger>
        <div className='flex h-9 min-w-[100px] max-w-[150px] items-center justify-center gap-2 rounded-lg bg-light-brown px-2'>
          <ValueViewComponent view={assetOut} showValue={false} />
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>Select asset</DialogHeader>
        <div className='flex flex-col gap-2 overflow-hidden px-[30px]'>
          {assets.map(d => (
            <div key={d.display} className='flex flex-col'>
              <DialogClose>
                <div
                  className={
                    'flex cursor-pointer justify-start gap-[6px] overflow-hidden py-[10px] font-bold text-muted-foreground hover:-mx-4 hover:bg-light-brown hover:px-4'
                  }
                  onClick={() => setAssetOut(d)}
                >
                  <AssetIcon metadata={d} />
                  <p className='truncate'>{d.symbol}</p>
                </div>
              </DialogClose>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
