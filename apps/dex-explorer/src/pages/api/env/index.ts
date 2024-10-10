import { NextApiRequest, NextApiResponse } from 'next';
import { getClientSideEnv } from '@/utils/env/getClientSideEnv';

export default function env(_req: NextApiRequest, res: NextApiResponse) {
  const env = getClientSideEnv();
  res.status(200).json(env);
}
