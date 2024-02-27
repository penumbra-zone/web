export interface GrpcConfig {
  grpcEndpoint: string;
  indexedDbVersion: number;
}

export const testnetConstants: GrpcConfig = {
  grpcEndpoint: "https://grpc.testnet.penumbra.zone",
  indexedDbVersion: 23,
};
