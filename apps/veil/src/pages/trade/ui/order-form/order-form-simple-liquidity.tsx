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
import { useEffect, useState } from 'react';

export const SimpleLiquidityOrderForm = observer(
  ({ parentStore }: { parentStore: OrderFormStore }) => {
    const { connected } = connectionStore;
    const { defaultDecimals, simpleLPForm: store } = parentStore;

    const priceSpread = DEFAULT_PRICE_SPREAD;
    const priceRange = DEFAULT_PRICE_RANGE;
    const [priceRanges, setPriceRanges] = useState<[number, number]>([
      store.marketPrice * (1 - priceSpread),
      store.marketPrice * (1 + priceSpread),
    ]);

    // values flow from local state to form store to keep ui smooth
    useEffect(() => {
      store.setLowerPriceInput(priceRanges[0]);
      store.setUpperPriceInput(priceRanges[1]);
    }, [store, priceRanges]);

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
                value: store.baseInput,
                decimals: store.baseAsset?.exponent ?? defaultDecimals,
              })}
              onChange={store.setBaseInput}
              asset={store.baseAsset}
              balance={store.baseAsset?.formatBalance()}
              onBalanceClick={() => {
                const target = store.baseAsset?.balance?.toString();
                if (target) {
                  store.setBaseInput(target);
                }
              }}
            />
          </div>
          <div className='mb-1'>
            <AmountInput
              value={round({
                value: store.quoteInput,
                decimals: store.quoteAsset?.exponent ?? defaultDecimals,
              })}
              onChange={store.setQuoteInput}
              asset={store.quoteAsset}
              balance={store.quoteAsset?.formatBalance()}
              onBalanceClick={() => {
                const target = store.quoteAsset?.balance?.toString();
                if (target) {
                  store.setQuoteInput(target);
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
