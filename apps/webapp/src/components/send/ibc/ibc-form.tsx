import { Button } from '@penumbra-zone/ui';

import { useToast } from '@penumbra-zone/ui/components/ui/use-toast.ts';
import { useStore } from '../../../state';
import { ibcSelector } from '../../../state/ibc.ts';
import InputToken from '../../shared/input-token.tsx';
import { amountToBig } from '../../../state/send.ts';
import { useLoaderData } from 'react-router-dom';
import { AssetBalance } from '../../../fetchers/balances.ts';
import { uint8ArrayToBase64 } from '@penumbra-zone/types';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1alpha1/num_pb';
import { ChainSelector } from './chain-selector.tsx';
import { InputBlock } from '../../shared/input-block.tsx';

export default function IbcForm() {
  const { toast } = useToast();
  const assetBalances = useLoaderData() as AssetBalance[];
  const {
    amount,
    asset,
    setAmount,
    setAsset,
    sendIbcWithdraw,
    destinationChainAddress,
    setDestinationChainAddress,
  } = useStore(ibcSelector);

  const selectedAssetBalance =
    assetBalances.find(i => uint8ArrayToBase64(i.assetId.inner) === asset.penumbraAssetId.inner)
      ?.amount ?? new Amount();

  return (
    <form
      className='flex flex-col gap-4'
      onSubmit={e => {
        e.preventDefault();
      }}
    >
      <InputToken
        label='Amount to send'
        placeholder='Enter an amount'
        className='mb-1'
        asset={{ ...asset, price: 10 }}
        assetBalance={amountToBig(asset, selectedAssetBalance)}
        setAsset={setAsset}
        value={amount}
        onChange={e => {
          if (Number(e.target.value) < 0) return;
          setAmount(e.target.value);
        }}
        validations={[
          {
            type: 'error',
            issue: 'insufficient funds',
            checkFn: () => false,
          },
        ]}
        balances={assetBalances}
      />
      <ChainSelector />
      <InputBlock
        label='Recipient on destination chain'
        placeholder='Enter the address'
        className='mb-1'
        value={destinationChainAddress ?? ''}
        onChange={e => setDestinationChainAddress(e.target.value)}
        validations={[]}
      />
      <Button
        type='submit'
        variant='gradient'
        className='mt-9'
        disabled={false}
        onClick={() => void sendIbcWithdraw(toast)}
      >
        Send
      </Button>
    </form>
  );
}
