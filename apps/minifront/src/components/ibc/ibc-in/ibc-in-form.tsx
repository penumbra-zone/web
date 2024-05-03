import { ChainDropdown } from './chain-dropdown';
import { CosmosWalletConnector } from './cosmos-wallet-connector';
import { AssetsTable } from './assets-table';
import { IbcChainProvider } from './chain-provider';
import { useRegistry } from '../../../fetchers/registry';
import { IbcInRequest } from './ibc-in-request';

export const IbcInForm = () => {
  const { data, isLoading, error } = useRegistry();

  if (isLoading) return <div>Loading registry...</div>;
  if (error) return <div>Error trying to load registry!</div>;
  if (!data) return <></>;

  return (
    <IbcChainProvider registry={data}>
      <div className='flex w-full flex-col gap-4 md:w-[340px] xl:w-[450px]'>
        <div className='flex justify-center'>
          <ChainDropdown />
        </div>
        <CosmosWalletConnector />
        <AssetsTable />
        <IbcInRequest />
      </div>
    </IbcChainProvider>
  );
};
