import { Button } from '@penumbra-zone/ui/components/ui/button';
import { Input } from '@penumbra-zone/ui/components/ui/input';
import { useStore } from '../../../state';
import { sendSelector, sendValidationErrors } from '../../../state/send';
import { InputBlock } from '../../shared/input-block';
import { LoaderFunction, useLoaderData } from 'react-router-dom';
import { getBalances } from '../../../fetchers/balances';
import { useMemo } from 'react';
import { penumbraAddrValidation } from '../helpers';
import { throwIfPraxNotConnectedTimeout } from '@penumbra-zone/client/prax';
import InputToken from '../../shared/input-token';
import { useRefreshFee } from './use-refresh-fee';
import { GasFee } from '../../shared/gas-fee';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { getStakingTokenMetadata } from '../../../fetchers/registry';

export interface SendLoaderResponse {
  assetBalances: BalancesResponse[];
  feeAssetMetadata: Metadata;
}

export const SendAssetBalanceLoader: LoaderFunction = async (): Promise<SendLoaderResponse> => {
  await throwIfPraxNotConnectedTimeout();
  const assetBalances = await getBalances();

  if (assetBalances[0]) {
    // set initial account if accounts exist and asset if account has asset list
    useStore.setState(state => {
      state.send.selection = assetBalances[0];
    });
  }
  const feeAssetMetadata = await getStakingTokenMetadata();

  return { assetBalances, feeAssetMetadata };
};

export const SendForm = () => {
  const { assetBalances, feeAssetMetadata } = useLoaderData() as SendLoaderResponse;
  const {
    selection,
    amount,
    recipient,
    memo,
    fee,
    feeTier,
    setAmount,
    setSelection,
    setRecipient,
    setFeeTier,
    setMemo,
    sendTx,
    txInProgress,
  } = useStore(sendSelector);

  useRefreshFee();

  const validationErrors = useMemo(() => {
    return sendValidationErrors(selection, amount, recipient);
  }, [selection, amount, recipient]);

  return (
    <form
      className='flex flex-col gap-4 xl:gap-3'
      onSubmit={e => {
        e.preventDefault();
        void sendTx();
      }}
    >
      <InputBlock
        label='Recipient'
        className='mb-1'
        value={recipient}
        validations={[penumbraAddrValidation()]}
      >
        <Input
          variant='transparent'
          className='font-mono'
          placeholder='penumbra1…'
          value={recipient}
          onChange={e => setRecipient(e.target.value)}
        />
      </InputBlock>
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

      <GasFee
        fee={fee}
        feeTier={feeTier}
        feeAssetMetadata={feeAssetMetadata}
        setFeeTier={setFeeTier}
      />

      <InputBlock
        label='Memo'
        value={memo}
        validations={[
          {
            type: 'error',
            issue: 'memo too long (>369 bytes)',
            checkFn: () => validationErrors.memoErr,
          },
        ]}
      >
        <Input
          variant='transparent'
          placeholder='Optional message'
          value={memo}
          onChange={e => setMemo(e.target.value)}
        />
      </InputBlock>
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
          !selection
        }
      >
        Send
      </Button>
    </form>
  );
};
