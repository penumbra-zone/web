import { NextResponse } from 'next/server';
import { getClientSideEnv } from '@/utils/env/getClientSideEnv';

export function GET() {
  const env = getClientSideEnv();
  return NextResponse.json(env);
}
