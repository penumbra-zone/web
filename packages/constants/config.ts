import { Base64Str } from '@penumbra-zone/types';

export interface Config {
  grpcEndpoint: string;
  indexedDbVersion: number;
  usdcAssetId: Base64Str;
}

export const testnetConstants: Config = {
  grpcEndpoint: 'https://grpc.testnet.penumbra.zone',
  indexedDbVersion: 18,
  usdcAssetId: 'reum7wQmk/owgvGMWMZn/6RFPV24zIKq3W6In/WwZgg=',
};
