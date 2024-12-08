import { NextRequest, NextResponse } from 'next/server';
import { pindexer } from '@/shared/database';
import { PositionTimelineResponse, TimelineApiResponse } from './types';
import { positionIdFromBech32 } from '@penumbra-zone/bech32m/plpid';
import { PositionId } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { serialize } from '@/shared/utils/serializer.ts';
import { getPositionState } from '@/shared/api/server/position/timeline/state.ts';
import { addValueViewsToVolume } from '@/shared/api/server/position/timeline/volume.ts';
import { addValueViewsToWithdrawals } from '@/shared/api/server/position/timeline/withdraws.ts';
import { addValueViewsToExecutions } from '@/shared/api/server/position/timeline/executions.ts';

export async function GET(req: NextRequest): Promise<NextResponse<TimelineApiResponse>> {
  try {
    const { searchParams } = new URL(req.url);
    const positionIdStr = searchParams.get('positionId');

    if (!positionIdStr) {
      return NextResponse.json({ error: 'Missing required positionId' }, { status: 400 });
    }

    const id = new PositionId(positionIdFromBech32(positionIdStr));

    const [state, executionsRaw, withdrawalsRaw, volumeAndFeesRaw] = await Promise.all([
      getPositionState(id),
      pindexer.getPositionExecutionsWithReserves(id),
      pindexer.getPositionWithdrawals(id),
      pindexer.getPositionVolumeAndFees(id),
    ]);

    const [executions, withdrawals, volumeAndFees] = await Promise.all([
      addValueViewsToExecutions(state, executionsRaw),
      addValueViewsToWithdrawals(state, withdrawalsRaw),
      addValueViewsToVolume(state, volumeAndFeesRaw),
    ]);

    const response = serialize({
      state,
      executions,
      volumeAndFees,
      withdrawals,
    } satisfies PositionTimelineResponse);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
