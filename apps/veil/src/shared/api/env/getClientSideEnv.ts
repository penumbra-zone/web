import { env } from '@/env';
import { ClientEnv } from './types';

const whitelist: (keyof ClientEnv)[] = [
  'PENUMBRA_CHAIN_ID',
  'PENUMBRA_CUILOA_URL',
  'PENUMBRA_GRPC_ENDPOINT',
];

export function getClientSideEnv(): ClientEnv {
  const initial: Partial<ClientEnv> = {};
  const clientEnv = whitelist.reduce((acc, key) => {
    acc[key] = env[key];
    return acc;
  }, initial);

  return clientEnv as ClientEnv;
}
