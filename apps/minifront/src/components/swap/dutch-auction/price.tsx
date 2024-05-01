import { AllSlices } from '../../../state';
import { useStoreShallow } from '../../../utils/use-store-shallow';
import { Input } from '@penumbra-zone/ui/components/ui/input';
import { AssetSelector } from '../../shared/asset-selector';
import { getAssetIdFromValueView } from '@penumbra-zone/getters/value-view';
import { useLoaderData } from 'react-router-dom';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';

const priceSelector = (state: AllSlices) => ({
  assetIn: state.dutchAuction.assetIn,
  assetOut: state.dutchAuction.assetOut,
  setAssetOut: state.dutchAuction.setAssetOut,
  minOutput: state.dutchAuction.minOutput,
  setMinOutput: state.dutchAuction.setMinOutput,
  maxOutput: state.dutchAuction.maxOutput,
  setMaxOutput: state.dutchAuction.setMaxOutput,
});

export const Price = () => {
  const { minOutput, setMinOutput, maxOutput, setMaxOutput, assetIn, assetOut, setAssetOut } =
    useStoreShallow(priceSelector);
  const assetInId = getAssetIdFromValueView(assetIn?.balanceView);
  const assets = useLoaderData() as Metadata[];

  return (
    <div className='flex grow items-center gap-4'>
      <div className='flex items-center gap-2'>
        <span className='text-muted-foreground'>Min:</span>
        <Input
          variant='transparent'
          value={minOutput}
          min={1}
          max={maxOutput}
          onChange={e => setMinOutput(e.target.value)}
          type='number'
          inputMode='numeric'
          className='grow'
        />
      </div>

      <div className='flex grow items-center gap-2'>
        <span className='text-muted-foreground'>Max:</span>
        <Input
          variant='transparent'
          value={maxOutput}
          min={minOutput}
          onChange={e => setMaxOutput(e.target.value)}
          type='number'
          inputMode='numeric'
          className='grow text-right'
        />
      </div>

      <div className='w-min'>
        <AssetSelector
          assets={assets}
          value={assetOut}
          onChange={setAssetOut}
          filter={asset => !asset.penumbraAssetId?.equals(assetInId)}
        />
      </div>
    </div>
  );
};
