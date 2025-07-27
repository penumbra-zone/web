import { ClientEnv } from './types';

const defaults = {
  PENUMBRA_CHAIN_ID: 'penumbra-testnet-phobos-3',
  PENUMBRA_CUILOA_URL: 'https://cuiloa.testnet.penumbra.zone',
  PENUMBRA_GRPC_ENDPOINT: 'https://testnet.plinfra.net',
  BASE_URL: 'http://localhost:3000',
};

export function getClientSideEnv(): ClientEnv {
  const whitelist: string[] = [
    'PENUMBRA_CHAIN_ID',
    'PENUMBRA_CUILOA_URL',
    'PENUMBRA_GRPC_ENDPOINT',
    'BASE_URL',
  ];

  return whitelist.reduce(
    (env, key) => ({
      ...env,
      [key]: process.env[key] ?? '',
    }),
    defaults,
  );
}
