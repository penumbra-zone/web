export interface GrpcConfig {
  grpcEndpoint: string;
  indexerEndpoint: string;
  cuiloaUrl: string;
  chainId: string;
}

const defaultPenumbraGrpcEndpoint = "https://penumbra-grpc.rockycrypt.com/"
const defaultIndexerEndpoint = "postgresql://penumbra:penumbra@db.testnet-preview.penumbra.zone:5432/penumbra?sslmode=disable"
const defaultChainId = "penumbra-1"
const defaultCuiolaUrl = "https://cuiloa.testnet.penumbra.zone"

export const Constants: GrpcConfig = {
  grpcEndpoint: process.env.PENUMBRA_GRPC_ENDPOINT ? process.env.PENUMBRA_GRPC_ENDPOINT : defaultPenumbraGrpcEndpoint,
  indexerEndpoint: process.env.PENUMBRA_INDEXER_ENDPOINT ? process.env.PENUMBRA_INDEXER_ENDPOINT : defaultIndexerEndpoint,
  cuiloaUrl: process.env.NEXT_PUBLIC_CUILOA_URL ? process.env.NEXT_PUBLIC_CUILOA_URL : defaultCuiolaUrl,
  chainId: process.env.NEXT_PUBLIC_CHAIN_ID ? process.env.NEXT_PUBLIC_CHAIN_ID : defaultChainId,
};
