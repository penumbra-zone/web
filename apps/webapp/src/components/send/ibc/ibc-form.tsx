import { Button } from '@penumbra-zone/ui';
import { useToast } from '@penumbra-zone/ui/components/ui/use-toast';
import { useStore } from '../../../state';
import { ibcSelector } from '../../../state/ibc';
import { ChainSelector } from './chain-selector';
import { InputBlock } from '../../shared/input-block';
import InputToken from '../../shared/input-token';
import { sendValidationErrors } from '../../../state/send';
import { useMemo } from 'react';
import { LoaderFunction, useLoaderData } from 'react-router-dom';
import { AccountBalance, getBalancesByAccount } from '../../../fetchers/balances';
import { penumbraAddrValidation } from '../helpers';

export const IbcAssetBalanceLoader: LoaderFunction = async (): Promise<AccountBalance[]> => {
  const balancesByAccount = await getBalancesByAccount();

  if (balancesByAccount[0]) {
    // set initial account if accounts exist and asset if account has asset list
    useStore.setState(state => {
      state.ibc.selection = {
        address: balancesByAccount[0]?.address,
        accountIndex: balancesByAccount[0]?.index,
        asset: balancesByAccount[0]?.balances[0],
      };
    });
  }

  return balancesByAccount;
};

export default function IbcForm() {
  const accountBalances = useLoaderData() as AccountBalance[];
  const { toast } = useToast();
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
    return sendValidationErrors(selection?.asset, amount, destinationChainAddress);
  }, [selection?.asset, amount, destinationChainAddress]);

  return (
    <form
      className='flex flex-col gap-4'
      onSubmit={e => {
        e.preventDefault();
        void sendIbcWithdraw(toast);
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
        balances={accountBalances}
        /**
         * @todo: Pass a real fee here once we're actually using this form. See
         * `<SendForm />` for an example of how to do this.
         */
        fee={undefined}
      />
      <ChainSelector />
      <InputBlock
        label='Recipient on destination chain'
        placeholder='Enter the address'
        className='mb-1'
        value={destinationChainAddress}
        onChange={e => setDestinationChainAddress(e.target.value)}
        validations={[penumbraAddrValidation()]}
      />
      <Button
        type='submit'
        variant='gradient'
        className='mt-9'
        disabled={
          !Number(amount) ||
          !destinationChainAddress ||
          !!Object.values(validationErrors).find(Boolean) ||
          !selection?.asset
        }
      >
        Send
      </Button>
    </form>
  );
}
