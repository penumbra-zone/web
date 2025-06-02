import { observer } from 'mobx-react-lite';
import { Button } from '@penumbra-zone/ui/Button';
import { Text } from '@penumbra-zone/ui/Text';
import { round } from '@penumbra-zone/types/round';
import { connectionStore } from '@/shared/model/connection';
import { ConnectButton } from '@/features/connect/connect-button';
import { AmountInput } from './amount-input';
import { InfoRow } from './info-row';
import { InfoRowGasFee } from './info-row-gas-fee';
import { OrderFormStore } from './store/OrderFormStore';
import { PriceSlider } from './price-slider';
import { useState } from 'react';

export const SimpleLiquidityOrderForm = observer(
  ({ parentStore }: { parentStore: OrderFormStore }) => {
    const { connected } = connectionStore;
    const { defaultDecimals, rangeForm: store } = parentStore;
    console.log('TCL: store', store);

    const deviation = 0.05;
    const sliderRange = 0.3;
    const [priceRange, setPriceRange] = useState<[number, number]>([
      store.marketPrice * (1 - deviation),
      store.marketPrice * (1 + deviation),
    ]);
    console.log('TCL: priceRange', priceRange[0], priceRange[1]);

    return (
      <div className='p-4'>
        <div className='mb-4'>
          <div className='leading-6'>
            <Text small color='text.secondary'>
              Enter Amounts
            </Text>
          </div>
          <div className='mb-1'>
            <AmountInput
              value={round({
                value: 100,
                decimals: 2,
              })}
              onChange={() => {}}
              asset={store.quoteAsset}
              balance={store.quoteAsset?.formatBalance()}
              onBalanceClick={() => {
                const target = store.quoteAsset?.balance?.toString();
                if (target) {
                  store.setLiquidityTargetInput(target);
                }
              }}
            />
          </div>
          <div className='mb-1'>
            <AmountInput
              value={round({
                value: 100,
                decimals: 2,
              })}
              onChange={() => {}}
              asset={store.baseAsset}
              balance={store.baseAsset?.formatBalance()}
              onBalanceClick={() => {
                const target = store.quoteAsset?.balance?.toString();
                if (target) {
                  store.setLiquidityTargetInput(target);
                }
              }}
            />
          </div>
        </div>
        <div className='mb-4'>
          <div className='leading-6 mb-4'>
            <Text small color='text.secondary'>
              Price Range
            </Text>
          </div>
          <PriceSlider
            min={store.marketPrice * (1 - sliderRange)}
            max={store.marketPrice * (1 + sliderRange)}
            values={priceRange}
            onInput={setPriceRange}
            marketPrice={store.marketPrice}
            quoteAsset={store.quoteAsset}
            baseAsset={store.baseAsset}
          />
        </div>
        <div className='mb-4'>
          <InfoRow label='LQT Rewards' value='Eligible' />
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
