import { localExtStorage } from '@penumbra-zone/storage/chrome/local';
import { WalletJson } from '@penumbra-zone/types/wallet';

/**
 * When a user first onboards with the extension, they won't have chosen a gRPC
 * endpoint yet. So we'll wait until they've chosen one to start trying to make
 * requests against it.
 */
export const onboardGrpcEndpoint = async (): Promise<string> => {
  const grpcEndpoint = await localExtStorage.get('grpcEndpoint');
  if (grpcEndpoint) return grpcEndpoint;

  return new Promise(resolve => {
    const storageListener = (changes: Record<string, { newValue?: unknown }>) => {
      const newValue = changes['grpcEndpoint']?.newValue;
      if (newValue && typeof newValue === 'string') {
        resolve(newValue);
        localExtStorage.removeListener(storageListener);
      }
    };
    localExtStorage.addListener(storageListener);
  });
};

export const onboardWallet = async (): Promise<WalletJson> => {
  const wallets = await localExtStorage.get('wallets');
  if (wallets[0]) return wallets[0];

  return new Promise(resolve => {
    const storageListener = (changes: Record<string, { newValue?: unknown }>) => {
      const newValue: unknown = changes['wallets']?.newValue;
      if (Array.isArray(newValue) && newValue[0]) {
        resolve(newValue[0] as WalletJson);
        localExtStorage.removeListener(storageListener);
      }
    };
    localExtStorage.addListener(storageListener);
  });
};

/**
 This fixes an issue where some users do not have 'grpcEndpoint' set after they have finished onboarding
 */
export const fixEmptyGrpcEndpointAfterOnboarding = async () => {
  //TODO change to mainnet default RPC
  const DEFAULT_GRPC_URL = 'https://grpc.testnet.penumbra.zone';
  const grpcEndpoint = await localExtStorage.get('grpcEndpoint');
  const wallets = await localExtStorage.get('wallets');
  if (!grpcEndpoint && wallets[0]) await localExtStorage.set('grpcEndpoint', DEFAULT_GRPC_URL);
};
