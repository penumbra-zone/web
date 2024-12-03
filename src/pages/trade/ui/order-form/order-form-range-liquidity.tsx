import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { Button } from '@penumbra-zone/ui/Button';
import { Text } from '@penumbra-zone/ui/Text';
import { Slider as PenumbraSlider } from '@penumbra-zone/ui/Slider';
import { connectionStore } from '@/shared/model/connection';
import { ConnectButton } from '@/features/connect/connect-button';
import { useSummary } from '../../model/useSummary';
import { OrderInput } from './order-input';
import { SelectGroup } from './select-group';
import { InfoRow } from './info-row';
import { useOrderFormStore, FormType } from './store';
import { UpperBoundOptions, LowerBoundOptions, FeeTierOptions } from './store/range-liquidity';

export const RangeLiquidityOrderForm = observer(() => {
  const { connected } = connectionStore;
  const { baseAsset, quoteAsset, rangeLiquidity, submitOrder, isLoading, gasFee, exchangeRate } =
    useOrderFormStore(FormType.RangeLiquidity);
  const { data } = useSummary('1d');
  const price = data && 'price' in data ? data.price : undefined;

  useEffect(() => {
    if (price) {
      rangeLiquidity.setMarketPrice(price);
    }
  }, [price, rangeLiquidity]);

  useEffect(() => {
    if (quoteAsset.exponent) {
      rangeLiquidity.setExponent(quoteAsset.exponent);
    }
  }, [quoteAsset.exponent, rangeLiquidity]);

  return (
    <div className='p-4'>
      <div className='mb-4'>
        <div className='mb-1'>
          <OrderInput
            label='Liquidity Amount'
            value={quoteAsset.amount}
            onChange={amount => quoteAsset.setAmount(amount)}
            denominator={quoteAsset.symbol}
          />
        </div>
        <div className='flex flex-row items-center justify-between py-1'>
          <Text small color='text.secondary'>
            Available Balance
          </Text>
          <button
            type='button'
            className='text-primary'
            onClick={connected ? () => quoteAsset.setAmount(quoteAsset.balance ?? 0) : undefined}
          >
            <Text small color='text.primary'>
              {quoteAsset.balance} {quoteAsset.symbol}
            </Text>
          </button>
        </div>
      </div>
      <div className='mb-4'>
        <div className='mb-2'>
          <OrderInput
            label='Upper bound'
            value={rangeLiquidity.upperBound}
            onChange={rangeLiquidity.setUpperBound}
            denominator={quoteAsset.symbol}
          />
        </div>
        <SelectGroup
          options={Object.values(UpperBoundOptions)}
          onChange={option => rangeLiquidity.setUpperBoundOption(option as UpperBoundOptions)}
        />
      </div>
      <div className='mb-4'>
        <div className='mb-2'>
          <OrderInput
            label='Lower bound'
            value={rangeLiquidity.lowerBound}
            onChange={rangeLiquidity.setLowerBound}
            denominator={quoteAsset.symbol}
          />
        </div>
        <SelectGroup
          options={Object.values(LowerBoundOptions)}
          onChange={option => rangeLiquidity.setLowerBoundOption(option as LowerBoundOptions)}
        />
      </div>
      <div className='mb-4'>
        <div className='mb-2'>
          <OrderInput
            label='Fee tier'
            value={rangeLiquidity.feeTier}
            onChange={rangeLiquidity.setFeeTier}
            denominator='%'
          />
        </div>
        <SelectGroup
          value={rangeLiquidity.feeTier}
          options={Object.values(FeeTierOptions)}
          onChange={rangeLiquidity.setFeeTierOption as (option: string) => void}
        />
      </div>
      <div className='mb-4'>
        <OrderInput
          label='Number of positions'
          value={rangeLiquidity.positions}
          onChange={rangeLiquidity.setPositions}
        />
        <PenumbraSlider
          min={5}
          max={15}
          step={1}
          value={rangeLiquidity.positions}
          showValue={false}
          onChange={rangeLiquidity.setPositions}
          showTrackGaps={true}
          trackGapBackground='base.black'
          showFill={true}
        />
      </div>
      <div className='mb-4'>
        <InfoRow label='Number of positions' value={rangeLiquidity.positions} toolTip='' />
        <InfoRow label='Base asset amount' value={baseAsset.amount} toolTip='' />
        <InfoRow label='Quote asset amount' value={quoteAsset.amount} toolTip='' />
        <InfoRow
          label='Gas Fee'
          isLoading={gasFee === null}
          value={`${gasFee} ${baseAsset.symbol}`}
          valueColor='success'
          toolTip='Gas fees tooltip here.'
        />
      </div>
      <div className='mb-4'>
        {connected ? (
          <Button actionType='accent' disabled={isLoading} onClick={submitOrder}>
            Open {rangeLiquidity.positions} Positions
          </Button>
        ) : (
          <ConnectButton actionType='default' />
        )}
      </div>
      {exchangeRate !== null && (
        <div className='flex justify-center p-1'>
          <Text small color='text.secondary'>
            1 {baseAsset.symbol} ={' '}
            <Text small color='text.primary'>
              {exchangeRate} {quoteAsset.symbol}
            </Text>
          </Text>
        </div>
      )}
    </div>
  );
});
