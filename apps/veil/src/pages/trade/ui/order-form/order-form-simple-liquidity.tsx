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
import { DEFAULT_PRICE_RANGE, DEFAULT_PRICE_SPREAD } from './store/SimpleLPFormStore';
import { PriceSlider } from './price-slider';
import { useState } from 'react';

export const SimpleLiquidityOrderForm = observer(
  ({ parentStore }: { parentStore: OrderFormStore }) => {
    const { connected } = connectionStore;
    const { defaultDecimals, rangeForm: store } = parentStore;
    console.log('TCL: store', store);

    const priceSpread = DEFAULT_PRICE_SPREAD;
    const priceRange = DEFAULT_PRICE_RANGE;
    const [priceRanges, setPriceRanges] = useState<[number, number]>([
      store.marketPrice * (1 - priceSpread),
      store.marketPrice * (1 + priceSpread),
    ]);
    console.log('TCL: priceRange', priceRanges[0], priceRanges[1]);

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
            min={store.marketPrice * (1 - priceRange)}
            max={store.marketPrice * (1 + priceRange)}
            values={priceRanges}
            onInput={setPriceRanges}
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
              Add Liquidity
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
