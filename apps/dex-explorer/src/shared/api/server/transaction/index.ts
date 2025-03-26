import { NextRequest, NextResponse } from 'next/server';
import { pindexer } from '@/shared/database';
import { TransactionApiResponse } from './types';
import { uint8ArrayToHex } from '@penumbra-zone/types/hex';

export async function GET(
  _req: NextRequest,
  { params }: { params: { txHash: string } },
): Promise<NextResponse<TransactionApiResponse>> {
  const txHash = params.txHash;
  if (!txHash) {
    return NextResponse.json({ error: 'txHash is required' }, { status: 400 });
  }

  const response = await pindexer.getTransaction(txHash);

  if (!response) {
    return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
  }

  return NextResponse.json({
    tx: uint8ArrayToHex(response.transaction),
    height: response.height,
  });
}
