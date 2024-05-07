import { IbcChainProvider } from './chain-provider';
import { useRegistry } from '../../../fetchers/registry';
import { IbcInForm } from './ibc-in-form';

export const InterchainUi = () => {
  const { data, isLoading, error } = useRegistry();

  if (isLoading) return <div>Loading registry...</div>;
  if (error) return <div>Error trying to load registry!</div>;
  if (!data) return <></>;

  return (
    <IbcChainProvider registry={data}>
      <IbcInForm />
    </IbcChainProvider>
  );
};
