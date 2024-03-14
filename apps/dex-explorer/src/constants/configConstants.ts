export interface GrpcConfig {
  grpcEndpoint: string;
  indexerEndpoint: string;
  cuiloaUrl: string;
}

const defaultPenumbraGrpcEndpoint = "https://grpc.testnet.penumbra.zone";
const defaultIndexerEndpoint = "postgresql://penumbra:penumbra@db.testnet-preview.penumbra.zone:5432/penumbra?sslmode=disable"

export const testnetConstants: GrpcConfig = {
  grpcEndpoint: process.env.PENUMBRA_GRPC_ENDPOINT ? process.env.PENUMBRA_GRPC_ENDPOINT : defaultPenumbraGrpcEndpoint,
  indexerEndpoint: process.env.PENUMBRA_INDEXER_ENDPOINT ? process.env.PENUMBRA_INDEXER_ENDPOINT : defaultIndexerEndpoint,
  cuiloaUrl: "https://cuiloa.testnet.penumbra.zone"
};
