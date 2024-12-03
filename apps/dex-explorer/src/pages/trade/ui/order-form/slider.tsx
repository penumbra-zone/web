import { observer } from 'mobx-react-lite';
import { connectionStore } from '@/shared/model/connection';
import { Slider as PenumbraSlider } from '@penumbra-zone/ui/Slider';
import { Text } from '@penumbra-zone/ui/Text';
import { OrderFormAsset } from './store/asset';

export const Slider = observer(({ asset, steps }: { asset: OrderFormAsset; steps: number }) => {
  const { connected } = connectionStore;
  return (
    <div className='mb-4'>
      <div className='mb-1'>
        <PenumbraSlider
          min={0}
          max={asset.balance ?? 7}
          step={asset.balance ? asset.balance / steps : 1}
          value={connected ? asset.amount : 0}
          showValue={false}
          onChange={connected ? asset.setAmount : undefined}
          showTrackGaps={true}
          trackGapBackground='base.black'
          showFill={true}
        />
      </div>
      <div className='flex flex-row items-center justify-between py-1'>
        <Text small color='text.secondary'>
          Available Balance
        </Text>
        <button
          type='button'
          className='text-primary'
          onClick={connected ? () => asset.setAmount(asset.balance ?? 0) : undefined}
        >
          <Text small color='text.primary'>
            {connected ? asset.balance : '--'} {asset.symbol}
          </Text>
        </button>
      </div>
    </div>
  );
});
