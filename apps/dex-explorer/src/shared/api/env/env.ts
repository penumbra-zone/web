import { ClientEnv } from '@/shared/api/env/types';

export const envQueryFn = async (): Promise<ClientEnv> => {
  const res = await fetch('/api/env');
  return (await res.json()) as ClientEnv;
};
