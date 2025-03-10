import { observer } from 'mobx-react-lite';
import { Button } from '@penumbra-zone/ui/Button';
import { Text } from '@penumbra-zone/ui/Text';
import { Slider as PenumbraSlider } from '@penumbra-zone/ui/Slider';
import { connectionStore } from '@/shared/model/connection';
import { ConnectButton } from '@/features/connect/connect-button';
import { OrderInput } from './order-input';
import { SelectGroup } from './select-group';
import { InfoRow } from './info-row';
import { InfoRowGasFee } from './info-row-gas-fee';
import { OrderFormStore } from './store/OrderFormStore';
import {
  MAX_POSITION_COUNT,
  MIN_POSITION_COUNT,
  UpperBoundOptions,
  LowerBoundOptions,
  FeeTierOptions,
} from './store/RangeOrderFormStore';

export const RangeLiquidityOrderForm = observer(
  ({ parentStore }: { parentStore: OrderFormStore }) => {
    const { connected } = connectionStore;
    const store = parentStore.rangeForm;

    return (
      <div className='p-4'>
        <div className='mb-4'>
          <div className='mb-1'>
            <OrderInput
              label='Liquidity Target'
              value={store.liquidityTargetInput}
              onChange={store.setLiquidityTargetInput}
              denominator={store.quoteAsset?.symbol}
            />
          </div>
          <div className='w-full flex flex-row flex-wrap items-start justify-between py-1'>
            <div className='leading-6'>
              <Text small color='text.secondary'>
                Available Balances
              </Text>
            </div>
            <div className='flex flex-wrap flex-col items-end'>
              <div>
                <Text small color='text.primary' whitespace='nowrap'>
                  {store.baseAsset?.formatBalance() ?? `-- ${store.baseAsset?.symbol}`}
                </Text>
              </div>
              <button
                type='button'
                className='text-primary'
                onClick={() => {
                  const target = store.quoteAsset?.balance?.toString();
                  if (target) {
                    store.setLiquidityTargetInput(target);
                  }
                }}
              >
                <Text small color='text.primary' whitespace='nowrap'>
                  {store.quoteAsset?.formatBalance() ?? `-- ${store.quoteAsset?.symbol}`}
                </Text>
              </button>
            </div>
          </div>
        </div>
        <div className='mb-4'>
          <div className='mb-2'>
            <OrderInput
              label='Upper Price Bound'
              value={store.upperPriceInput}
              onChange={price => store.setUpperPriceInput(price)}
              denominator={store.quoteAsset?.symbol}
            />
          </div>
          <SelectGroup
            options={Object.values(UpperBoundOptions)}
            value={store.upperPriceInputOption}
            onChange={option => store.setUpperPriceInputOption(option as UpperBoundOptions)}
          />
        </div>
        <div className='mb-4'>
          <div className='mb-2'>
            <OrderInput
              label='Lower Price Bound'
              value={store.lowerPriceInput}
              onChange={price => store.setLowerPriceInput(price)}
              denominator={store.quoteAsset?.symbol}
            />
          </div>
          <SelectGroup
            options={Object.values(LowerBoundOptions)}
            value={store.lowerPriceInputOption}
            onChange={option => store.setLowerPriceInputOption(option as LowerBoundOptions)}
          />
        </div>
        <div className='mb-4'>
          <div className='mb-2'>
            <OrderInput
              label='Fee tier'
              value={store.feeTierPercentInput}
              onChange={amount => store.setFeeTierPercentInput(amount)}
              denominator='%'
            />
          </div>
          <SelectGroup
            options={Object.values(FeeTierOptions)}
            value={store.feeTierPercentInputOption}
            onChange={option => store.setFeeTierPercentInputOption(option as FeeTierOptions)}
          />
        </div>
        <div className='mb-4'>
          <OrderInput
            label='Number of positions'
            value={store.positionCountInput}
            onChange={store.setPositionCountInput}
          />
          <PenumbraSlider
            min={MIN_POSITION_COUNT}
            max={MAX_POSITION_COUNT}
            step={1}
            value={store.positionCountSlider}
            showValue={false}
            onChange={store.setPositionCountSlider}
            showTrackGaps={true}
            trackGapBackground='base.black'
            showFill={true}
          />
        </div>
        <div className='mb-4'>
          <InfoRow
            label='Number of positions'
            value={store.positionCount}
            toolTip='Each position will have an equal amount of liquidity allocated to it, as the price varies.'
          />
          <InfoRow
            label='Base asset amount'
            value={store.baseAssetAmount}
            toolTip={`The amount of ${store.baseAsset?.symbol} provided as liquidity.`}
          />
          <InfoRow
            label='Quote asset amount'
            value={store.quoteAssetAmount}
            toolTip={`The amount of ${store.quoteAsset?.symbol} provided as liquidity`}
          />
          <InfoRowGasFee
            gasFee={parentStore.gasFee.display}
            symbol={parentStore.gasFee.symbol}
            isLoading={parentStore.gasFeeLoading}
          />
        </div>
        <div className='mb-4'>
          {connected ? (
            <Button
              actionType='accent'
              disabled={!parentStore.canSubmit}
              onClick={() => void parentStore.submit()}
            >
              Open {store.positionCount ?? 'Several'} Positions
            </Button>
          ) : (
            <ConnectButton actionType='default' />
          )}
        </div>
        {parentStore.marketPrice && (
          <div className='flex justify-center p-1'>
            <Text small color='text.secondary'>
              1 {store.baseAsset?.symbol} ={' '}
              <Text small color='text.primary'>
                {store.quoteAsset?.formatDisplayAmount(parentStore.marketPrice)}
              </Text>
            </Text>
          </div>
        )}
      </div>
    );
  },
);
