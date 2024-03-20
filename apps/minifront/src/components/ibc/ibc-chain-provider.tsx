import { cosmosTestnets } from '../../ibc/ibc-chains';
import { cosmosTestnetAssets } from '../../ibc/ibc-assets';
import { ChainProvider } from '@cosmos-kit/react';

import { wallets as keplrWallets } from '@cosmos-kit/keplr-extension';
import { wallets as leapwallets } from '@cosmos-kit/leap';
//import { wallets as cosmostationWallets } from '@cosmos-kit/cosmostation';
const noMobileWallets = [
  ...keplrWallets,
  ...leapwallets,
  //...cosmostationWallets,
];

export const IbcChainProvider = ({
  children,
}: {
  children: React.ReactNode | React.ReactNode[];
}) => (
  <ChainProvider chains={cosmosTestnets} assetLists={cosmosTestnetAssets} wallets={noMobileWallets}>
    {children}
  </ChainProvider>
);
