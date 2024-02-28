export interface GrpcConfig {
  grpcEndpoint: string;
}

const defaultPenumbraGrpcEndpoint = "https://grpc.testnet.penumbra.zone";

export const testnetConstants: GrpcConfig = {
  grpcEndpoint: process.env.PENUMBRA_GRPC_ENDPOINT ? process.env.PENUMBRA_GRPC_ENDPOINT : defaultPenumbraGrpcEndpoint,
};
