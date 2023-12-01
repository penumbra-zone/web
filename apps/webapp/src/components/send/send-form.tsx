import { Button, Switch } from '@penumbra-zone/ui';
import { useStore } from '../../state';
import { amountToBig, sendSelector, sendValidationErrors } from '../../state/send';
import { useToast } from '@penumbra-zone/ui/components/ui/use-toast';
import { isPenumbraAddr, uint8ArrayToBase64 } from '@penumbra-zone/types';
import { InputBlock } from '../shared/input-block.tsx';
import InputToken from '../shared/input-token.tsx';
import { LoaderFunction, useLoaderData } from 'react-router-dom';
import { AccountBalance, getBalancesByAccount } from '../../fetchers/balances.ts';
import { throwIfExtNotInstalled } from '../../fetchers/is-connected.ts';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1alpha1/num_pb';
import { useMemo } from 'react';

export const AssetBalanceLoader: LoaderFunction = async (): Promise<AccountBalance[]> => {
  await throwIfExtNotInstalled();
  return await getBalancesByAccount();
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
    setAsset,
    setRecipient,
    setMemo,
    setHidden,
    sendTx,
    txInProgress,
  } = useStore(sendSelector);

  const selectedAssetBalance = useMemo(() => {
    return (
      accountBalances
        .find(i => i.index === account)
        ?.balances.find(i => uint8ArrayToBase64(i.assetId.inner) === asset.penumbraAssetId.inner)
        ?.amount ?? new Amount()
    );
  }, [accountBalances, asset, account]);

  const validationErrors = sendValidationErrors(asset, amount, recipient, selectedAssetBalance);

  return (
    <form
      className='flex flex-col gap-4 xl:gap-3'
      onSubmit={e => {
        e.preventDefault();
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
        asset={{ ...asset, price: 10 }}
        setAsset={setAsset}
        value={amount}
        onChange={e => {
          if (Number(e.target.value) < 0) return;
          setAmount(e.target.value);
        }}
        assetBalance={amountToBig(asset, selectedAssetBalance)}
        validations={[
          {
            type: 'error',
            issue: 'insufficient funds',
            checkFn: () => validationErrors.amountErr,
          },
        ]}
        balances={accountBalances}
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
        onClick={() => void sendTx(toast)}
        disabled={
          !Number(amount) ||
          !recipient ||
          !!Object.values(validationErrors).find(Boolean) ||
          txInProgress
        }
      >
        Send
      </Button>
    </form>
  );
};
