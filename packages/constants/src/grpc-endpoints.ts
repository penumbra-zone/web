import { STAKING_TOKEN_METADATA } from './assets';

interface GrpcEndpoint {
  name: string;
  url: string;
  imageUrl?: string;
}

export const GRPC_ENDPOINTS: GrpcEndpoint[] = [
  {
    name: 'Penumbra Labs Testnet RPC',
    url: 'https://grpc.testnet.penumbra.zone',
    imageUrl: STAKING_TOKEN_METADATA.images[0]?.svg,
  },
];
