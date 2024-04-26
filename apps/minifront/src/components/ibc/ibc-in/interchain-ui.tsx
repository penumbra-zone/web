import { IbcChainProvider } from './chain-provider';
import { useRegistry } from '../../../fetchers/registry';
import { CosmosWalletConnector } from './cosmos-wallet-connector';
import { ChainDropdown } from './chain-dropdown';

export const InterchainUi = () => {
  const { data, isLoading, error } = useRegistry();

  if (isLoading) return <div>Loading registry...</div>;
  if (error) return <div>Error trying to load registry!</div>;
  if (!data) return <></>;

  return (
    <IbcChainProvider registry={data}>
      {/* negative margin offsets div inserted by provider */}
      <div className='-mt-4'>
        <ChainDropdown />
      </div>
      <CosmosWalletConnector />
    </IbcChainProvider>
  );
};
