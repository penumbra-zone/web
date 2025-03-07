import { NextRequest, NextResponse } from 'next/server';
import { bech32mPositionId } from '@penumbra-zone/bech32m/plpid';
import { ChainRegistryClient } from '@penumbra-labs/registry';
import { AssetId } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { PositionId } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { serialize, Serialized } from '@/shared/utils/serializer';
import { toValueView } from '@/shared/utils/value-view';
import { getURLParams, LeaderboardData, LeaderboardPageInfo, intervalFilterToSQL } from './utils';
import { pindexer } from '@/shared/database';

export const GET = async (
  req: NextRequest,
): Promise<NextResponse<Serialized<LeaderboardPageInfo | { error: string }>>> => {
  const chainId = process.env['PENUMBRA_CHAIN_ID'];
  if (!chainId) {
    return NextResponse.json({ error: 'Error: PENUMBRA_CHAIN_ID is not set' }, { status: 500 });
  }

  try {
    const registryClient = new ChainRegistryClient();
    const registry = await registryClient.remote.get(chainId);

    const filters = getURLParams(new URLSearchParams(req.nextUrl.search));
    const result = await pindexer.queryLeaderboard(
      filters.limit,
      intervalFilterToSQL[filters.interval],
      filters.base,
      filters.quote,
    );

    const mapped = await Promise.all(
      result.map(position => {
        const asset1 = new AssetId({ inner: position.context_asset_start });
        const asset2 = new AssetId({ inner: position.context_asset_end });
        const metadata1 = registry.tryGetMetadata(asset1);
        const metadata2 = registry.tryGetMetadata(asset2);

        if (!metadata1 || !metadata2) {
          return undefined;
        }

        return {
          asset1: metadata1,
          asset2: metadata2,
          executions: position.executionCount,
          positionId: bech32mPositionId(new PositionId({ inner: position.position_id })),
          volume1: toValueView({
            amount: position.volume1,
            metadata: metadata1,
          }),
          volume2: toValueView({
            amount: position.volume2,
            metadata: metadata2,
          }),
          fees1: toValueView({
            amount: position.fees1,
            metadata: metadata1,
          }),
          fees2: toValueView({
            amount: position.fees2,
            metadata: metadata2,
          }),
        } satisfies LeaderboardData;
      }),
    );

    // Group by positionId and take entry with the most number of executions
    const uniquePositions = Object.values(
      (mapped.filter(Boolean) as LeaderboardData[]).reduce<Record<string, LeaderboardData>>(
        (acc, position) => {
          const existingPosition = acc[position.positionId];
          if (!existingPosition || existingPosition.executions < position.executions) {
            acc[position.positionId] = position;
          }
          return acc;
        },
        {},
      ),
    );

    return NextResponse.json(serialize({ data: uniquePositions, filters }));
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
};
