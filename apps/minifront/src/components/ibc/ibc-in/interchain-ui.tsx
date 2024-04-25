import { IbcChainProvider } from './chain-provider';
import { useRegistry } from '../../../fetchers/registry';
import { ChainPicker } from './chain-picker';

export const InterchainUi = () => {
  const { data, isLoading, error } = useRegistry();

  if (isLoading) return <div>Loading registry...</div>;
  if (error) return <div>Error trying to load registry!</div>;
  if (!data) return <></>;

  return (
    <IbcChainProvider registry={data}>
      {/* negative margin offsets div inserted by provider */}
      <div className='-mt-4'>
        <ChainPicker />
      </div>
      {/* WalletSection to go here */}
    </IbcChainProvider>
  );
};
