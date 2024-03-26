import { Card } from '@penumbra-zone/ui/components/ui/card';
import { ChainSelector } from './chain-selector';
import { Button } from '@penumbra-zone/ui/components/ui/button';
import { useLoaderData } from 'react-router-dom';
import { IbcLoaderResponse } from './ibc-loader';
import { useStore } from '../../state';
import { filterBalancesPerChain, ibcSelector, ibcValidationErrors } from '../../state/ibc';
import InputToken from '../shared/input-token';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { SelectAccount } from '@penumbra-zone/ui/components/ui/select-account';
import { getAddrByIndex } from '../../fetchers/address';

export const IbcInForm = () => {
  const assetBalances = useLoaderData() as IbcLoaderResponse;
  const {
    sendIbcWithdraw,
    destinationChainAddress,
    setDestinationChainAddress,
    amount,
    setAmount,
    selection,
    setSelection,
    chain,
  } = useStore(ibcSelector);
  const filteredBalances = filterBalancesPerChain(assetBalances, chain);
  const validationErrors = useStore(ibcValidationErrors);

  return (
    <Card light>
      <form
        className='flex flex-col gap-4'
        onSubmit={e => {
          e.preventDefault();
          //void sendIbcDeposit();
        }}
      >
        <ChainSelector />
        <InputToken
          label='Amount to shield'
          placeholder='Enter an amount'
          className='mb-1 text-muted'
          selection={selection}
          value={amount}
          onChange={e => {
            if (Number(e.target.value) < 0) return;
            setAmount(e.target.value);
          }}
          setSelection={function (selection: BalancesResponse): void {
            // no
          }}
          balances={filteredBalances}
        />
        <Button type='submit' variant='gradient'>
          Shield
        </Button>
      </form>
    </Card>
  );
};
