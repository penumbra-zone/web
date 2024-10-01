export interface ConstantsConfig {
  cuiloaUrl: string;
  chainId: string;
}

const defaultChainId = "penumbra-1";
const defaultCuiolaUrl = "https://cuiloa.testnet.penumbra.zone";

export const Constants: ConstantsConfig = {
  cuiloaUrl: process.env["NEXT_PUBLIC_CUILOA_URL"] ?? defaultCuiolaUrl,
  chainId: process.env["NEXT_PUBLIC_CHAIN_ID"] ?? defaultChainId,
};
