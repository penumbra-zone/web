import { localExtStorage } from '@penumbra-zone/storage/chrome/local';

export const onboardGrpcEndpoint = () => localExtStorage.waitFor('grpcEndpoint');
export const onboardWallet = () => localExtStorage.waitFor('wallets');

/**
 This fixes an issue where some users do not have 'grpcEndpoint' set after they have finished onboarding
 */
export const fixEmptyGrpcEndpointAfterOnboarding = async () => {
  console.log('fix grpc endpoint');
  //TODO change to mainnet default RPC
  const DEFAULT_GRPC_URL = 'https://grpc.testnet.penumbra.zone';
  const grpcEndpoint = await localExtStorage.get('grpcEndpoint');
  const wallets = await localExtStorage.get('wallets');
  if (!grpcEndpoint && wallets[0]) {
    console.log('fixing grpc');
    await localExtStorage.set('grpcEndpoint', DEFAULT_GRPC_URL);
  } else console.log('NOT fixing grpc');
};
