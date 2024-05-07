import { ChainDropdown } from './chain-dropdown';
import { CosmosWalletConnector } from './cosmos-wallet-connector';
import { AssetsTable } from './assets-table';
import { IbcInRequest } from './ibc-in-request';
import { AllSlices, useStore } from '../../../state';
import { useChainConnector } from './hooks';
import { FormEvent, MouseEvent } from 'react';

export const IbcInForm = () => {
  const issueTx = useStore(({ ibcIn }: AllSlices) => ibcIn.issueTx);
  const { address, getSigningStargateClient } = useChainConnector();

  const handleSubmit = (event: FormEvent | MouseEvent) => {
    event.preventDefault();

    void issueTx(getSigningStargateClient, address);
  };

  return (
    <form className='flex w-full flex-col gap-4 md:w-[340px] xl:w-[450px]' onSubmit={handleSubmit}>
      <div className='flex justify-center'>
        <ChainDropdown />
      </div>
      <CosmosWalletConnector />
      <AssetsTable />
      <IbcInRequest />
    </form>
  );
};
