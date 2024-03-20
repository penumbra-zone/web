import { IbcInForm } from './ibc-in-form';
import { IbcOutForm } from './ibc-out-form';

import { useChain } from '@cosmos-kit/react';
import '@interchain-ui/react/styles';

export const IbcLayout = () => {
  const chainContext = useChain('osmosistestnet');
  const osmosisSendTx: typeof chainContext.sendTx = (tx, mode) => chainContext.sendTx(tx, mode);
  //const keplerExtensionWallet = useWallet('keplr-extension');
  //const osmosisChainWallet = useChainWallet('osmosistestnet', 'keplr-extension');

  //const { status, username, address, message, connect, disconnect, openView, } = chainContext;

  console.log({ chainContext });
  return (
    <div className='grid gap-8 md:grid-cols-2  lg:gap-[30%]'>
      <IbcInForm sendTx={osmosisSendTx} />
      <IbcOutForm prefillDestination={chainContext.address} />
    </div>
  );
};
