import { Button, Input } from '@penumbra-zone/ui';
import { useStore } from '../../../state';
import { ibcSelector } from '../../../state/ibc';
import { ChainSelector } from './chain-selector';
import { InputBlock } from '../../shared/input-block';
import InputToken from '../../shared/input-token';
import { validateAmount } from '../../../state/send';
import { useMemo } from 'react';
import { LoaderFunction, useLoaderData } from 'react-router-dom';
import { AssetBalance, getAssetBalances } from '../../../fetchers/balances';
import { testnetIbcChains } from '@penumbra-zone/constants';

export const IbcAssetBalanceLoader: LoaderFunction = async (): Promise<AssetBalance[]> => {
  const assetBalances = await getAssetBalances();

  if (assetBalances[0]) {
    // set initial account if accounts exist and asset if account has asset list
    useStore.setState(state => {
      state.ibc.selection = assetBalances[0];
      state.ibc.chain = testnetIbcChains[0];
    });
  }

  return assetBalances;
};

export default function IbcForm() {
  const assetBalances = useLoaderData() as AssetBalance[];
  const {
    sendIbcWithdraw,
    destinationChainAddress,
    setDestinationChainAddress,
    amount,
    setAmount,
    selection,
    setSelection,
  } = useStore(ibcSelector);

  const validationErrors = useMemo(() => {
    return ibcValidationErrors(selection, amount, destinationChainAddress);
  }, [selection, amount, destinationChainAddress]);

  return (
    <form
      className='flex flex-col gap-4'
      onSubmit={e => {
        e.preventDefault();
        void sendIbcWithdraw();
      }}
    >
      <InputToken
        label='Amount to send'
        placeholder='Enter an amount'
        className='mb-1'
        selection={selection}
        setSelection={setSelection}
        value={amount}
        onChange={e => {
          if (Number(e.target.value) < 0) return;
          setAmount(e.target.value);
        }}
        validations={[
          {
            type: 'error',
            issue: 'insufficient funds',
            checkFn: () => validationErrors.amountErr,
          },
        ]}
        balances={assetBalances}
      />
      <ChainSelector />
      <InputBlock
        label='Recipient on destination chain'
        className='mb-1'
        value={destinationChainAddress}
        validations={[]}
      >
        <Input
          variant='transparent'
          placeholder='Enter the address'
          value={destinationChainAddress}
          onChange={e => setDestinationChainAddress(e.target.value)}
        />
      </InputBlock>
      <Button
        type='submit'
        variant='gradient'
        className='mt-9'
        disabled={
          !Number(amount) ||
          !destinationChainAddress ||
          !!Object.values(validationErrors).find(Boolean) ||
          !selection
        }
      >
        Send
      </Button>
    </form>
  );
}

interface IbcValidationFields {
  recipientErr: boolean;
  amountErr: boolean;
}

const ibcValidationErrors = (
  asset: AssetBalance | undefined,
  amount: string,
  recipient: string,
): IbcValidationFields => {
  return {
    recipientErr: !recipient, // TODO: validate recipient addr matches chain
    amountErr: !asset ? false : validateAmount(asset, amount),
  };
};
