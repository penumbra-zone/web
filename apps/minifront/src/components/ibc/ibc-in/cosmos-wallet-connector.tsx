import { useStore } from '../../../state';
import { ibcInSelector } from '../../../state/ibc-in';

export const CosmosWalletConnector = () => {
  const { chain } = useStore(ibcInSelector);

  // const {
  //   connect,
  //   openView,
  //   status,
  //   username,
  //   address,
  //   message,
  //   wallet,
  //   chain: chainInfo,
  // } = useChain(providedChainName || defaultChainName);

  return <div>{chain?.chainName}</div>;
};
