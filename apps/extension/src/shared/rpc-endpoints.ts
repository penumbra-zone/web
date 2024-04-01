interface RpcEndpoint {
  name: string;
  url: string;
  imageUrl?: string;
}

export const RPC_ENDPOINTS: RpcEndpoint[] = [
  {
    name: 'Penumbra Labs Testnet RPC',
    url: 'https://grpc.testnet.penumbra.zone',
  },
  {
    name: 'Penumbra Labs Testnet Preview RPC',
    url: 'https://grpc.testnet-preview.penumbra.zone',
  },
];
