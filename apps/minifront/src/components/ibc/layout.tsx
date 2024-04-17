import { Card } from '@penumbra-zone/ui/components/ui/card';
import { IbcInForm } from './ibc-in-form';
import { IbcOutForm } from './ibc-out-form';
import { IbcChainProvider } from './ibc-chain-provider';

//import '@interchain-ui/react/styles';

export const IbcLayout = () => {
  return (
    <div className='flex flex-1 flex-col gap-4 md:flex-row md:place-content-around'>
      <Card className='md:self-start'>
        <IbcChainProvider>
          <IbcInForm />
        </IbcChainProvider>
      </Card>
      <Card className='md:self-end'>
        <IbcChainProvider>
          <IbcOutForm />
        </IbcChainProvider>
      </Card>
    </div>
  );
};
