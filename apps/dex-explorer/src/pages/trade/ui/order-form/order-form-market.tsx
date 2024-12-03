import { observer } from 'mobx-react-lite';
import { Button } from '@penumbra-zone/ui/Button';
import { Text } from '@penumbra-zone/ui/Text';
import { connectionStore } from '@/shared/model/connection';
import { OrderInput } from './order-input';
import { SegmentedControl } from './segmented-control';
import { ConnectButton } from '@/features/connect/connect-button';
import { Slider } from './slider';
import { InfoRow } from './info-row';
import { useOrderFormStore, FormType, Direction } from './store';

export const MarketOrderForm = observer(() => {
  const { connected } = connectionStore;
  const {
    baseAsset,
    quoteAsset,
    direction,
    setDirection,
    submitOrder,
    isLoading,
    gasFee,
    exchangeRate,
  } = useOrderFormStore(FormType.Market);

  const isBuy = direction === Direction.Buy;

  return (
    <div className='p-4'>
      <SegmentedControl direction={direction} setDirection={setDirection} />
      <div className='mb-4'>
        <OrderInput
          label={direction}
          value={baseAsset.amount}
          onChange={amount => baseAsset.setAmount(amount)}
          min={0}
          max={1000}
          isEstimating={isBuy ? baseAsset.isEstimating : false}
          isApproximately={isBuy}
          denominator={baseAsset.symbol}
        />
      </div>
      <div className='mb-4'>
        <OrderInput
          label={isBuy ? 'Pay with' : 'Receive'}
          value={quoteAsset.amount}
          onChange={amount => quoteAsset.setAmount(amount)}
          isEstimating={isBuy ? false : quoteAsset.isEstimating}
          isApproximately={!isBuy}
          denominator={quoteAsset.symbol}
        />
      </div>
      <Slider steps={8} asset={isBuy ? quoteAsset : baseAsset} />
      <div className='mb-4'>
        <InfoRow
          label='Trading Fee'
          value='Free'
          valueColor='success'
          toolTip='On Penumbra, trading fees are completely free.'
        />
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
          <Button
            actionType='accent'
            disabled={isLoading || !baseAsset.amount || !quoteAsset.amount}
            onClick={submitOrder}
          >
            {direction} {baseAsset.symbol}
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
