import { Button, Switch } from '@penumbra-zone/ui';
import { useStore } from '../../state';
import { sendSelector, sendValidationErrors } from '../../state/send';
import { useToast } from '@penumbra-zone/ui/components/ui/use-toast';
import { isPenumbraAddr } from '@penumbra-zone/types';
import { InputBlock } from '../shared/input-block.tsx';
import InputToken from '../shared/input-token.tsx';
import { LoaderFunction, useLoaderData } from 'react-router-dom';
import { AccountBalance, getBalancesByAccount } from '../../fetchers/balances.ts';
import { throwIfExtNotInstalled } from '../../fetchers/is-connected.ts';
import { useMemo } from 'react';

export const AssetBalanceLoader: LoaderFunction = async (): Promise<AccountBalance[]> => {
  await throwIfExtNotInstalled();

  const balancesByAccount = await getBalancesByAccount();

  if (balancesByAccount.length) {
    useStore.setState(state => {
      state.send.account = balancesByAccount[0]?.address ?? '';
    });
  }

  if (balancesByAccount[0]?.balances.length) {
    useStore.setState(state => {
      state.send.asset = balancesByAccount[0]?.balances[0];
    });
  }

  return balancesByAccount;
};

export const SendForm = () => {
  const accountBalances = useLoaderData() as AccountBalance[];
  const { toast } = useToast();
  const {
    account,
    amount,
    asset,
    recipient,
    memo,
    hidden,
    setAmount,
    setAccountAsset,
    setRecipient,
    setMemo,
    setHidden,
    sendTx,
    txInProgress,
  } = useStore(sendSelector);

  const validationErrors = useMemo(() => {
    return sendValidationErrors(asset, amount, recipient);
  }, [asset, amount, recipient]);

  return (
    <form
      className='flex flex-col gap-4 xl:gap-3'
      onSubmit={e => {
        e.preventDefault();
        void sendTx(toast);
      }}
    >
      <InputBlock
        label='Recipient'
        placeholder='Enter the address'
        className='mb-1'
        value={recipient}
        onChange={e => setRecipient(e.target.value)}
        validations={[
          {
            type: 'error',
            issue: 'invalid address',
            checkFn: (addr: string) => Boolean(addr) && !isPenumbraAddr(addr),
          },
        ]}
      />
      <InputToken
        label='Amount to send'
        placeholder='Enter an amount'
        className='mb-1'
        asset={asset}
        setAccountAsset={setAccountAsset}
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
        account={account}
      />
      <InputBlock
        label='Memo'
        placeholder='Optional message'
        value={memo}
        onChange={e => setMemo(e.target.value)}
      />
      <div className='flex items-center justify-between md:-mt-2 xl:mt-1'>
        <div className='flex items-start gap-2'>
          <img src='/incognito.svg' alt='Incognito' className='h-5 w-5' />
          <p className='font-bold'>Hide Sender from Recipient</p>
        </div>
        <Switch id='sender-mode' checked={hidden} onCheckedChange={checked => setHidden(checked)} />
      </div>
      <Button
        type='submit'
        variant='gradient'
        className='mt-3'
        size='lg'
        disabled={
          !Number(amount) ||
          !recipient ||
          !!Object.values(validationErrors).find(Boolean) ||
          txInProgress ||
          !asset
        }
      >
        Send
      </Button>
    </form>
  );
};
