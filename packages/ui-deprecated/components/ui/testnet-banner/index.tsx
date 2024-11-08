import { Banner } from '../banner';

export const TestnetBanner = ({ chainId }: { chainId?: string }) =>
  chainId?.includes('testnet') && (
    <Banner
      type='warning'
      title={`You are using ${chainId}.`}
      content={`
        Testnet tokens are solely to allow testing the Penumbra protocol.
        Testnet tokens have no monetary value. Testnet activity has no relation to mainnet.
      `}
    />
  );
