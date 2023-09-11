export interface Constants {
  grpcEndpoint: string;
  indexedDbVersion: number;
}

export const testnetConstants: Constants = {
  grpcEndpoint: 'https://grpc.testnet.penumbra.zone',
  indexedDbVersion: 12,
};
