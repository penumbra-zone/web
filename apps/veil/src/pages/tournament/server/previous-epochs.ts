import { sql } from 'kysely';
import { NextRequest, NextResponse } from 'next/server';
import { ChainRegistryClient } from '@penumbra-labs/registry';
import { addressFromBech32m, isAddress } from '@penumbra-zone/bech32m/penumbra';
import { Address } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { AssetId } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { serialize, Serialized } from '@/shared/utils/serializer';
import { FinishedEpochs, Votes } from '@/shared/database/schema';
import { pindexerDb } from '@/shared/database/client';
import { uint8ArrayToBase64 } from '@penumbra-zone/types/base64';
import { uint8ArrayToHex } from '@penumbra-zone/types/hex';

const SORT_KEYS = ['epoch', 'lpReward', 'votingReward', ''] as const;
export type PreviousEpochsSortKey = (typeof SORT_KEYS)[number];

const DIRECTIONS = ['asc', 'desc', ''] as const;
export type PreviousEpochsSortDirection = (typeof DIRECTIONS)[number];

export interface PreviousEpochsRequest {
  limit: number;
  page: number;
  address?: string;
  sortKey: PreviousEpochsSortKey;
  sortDirection: PreviousEpochsSortDirection;
}

interface AggregatedVotes extends Votes {
  reward: number;
}

export type PreviousEpochsApiResponse = FinishedEpochs[];

const DEFAULT_LIMIT = 10;

export const getQueryParams = (req: NextRequest): PreviousEpochsRequest => {
  const { searchParams } = new URL(req.url);

  const limit = Number(searchParams.get('limit')) || DEFAULT_LIMIT;
  const page = Number(searchParams.get('page')) || 1;

  const sortKeyParam = searchParams.get('sortKey');
  const sortKey = sortKeyParam && SORT_KEYS.includes(sortKeyParam as PreviousEpochsSortKey) ? sortKeyParam as PreviousEpochsSortKey : 'epoch';

  const sortDirectionParam = searchParams.get('sortDirection');
  const sortDirection = sortDirectionParam && DIRECTIONS.includes(sortDirectionParam as PreviousEpochsSortDirection) ? sortDirectionParam as PreviousEpochsSortDirection : 'desc';

  const addressParam = searchParams.get('address') ?? undefined;
  const address = addressParam && isAddress(addressParam) ? addressParam : undefined;

  return {
    limit,
    page,
    address,
    sortKey,
    sortDirection,
  };
};

const previousEpochsQuery = async ({ limit, page, address }: PreviousEpochsRequest) => {
  const votes = pindexerDb
    .selectFrom('lqt._votes as votes')
    .orderBy('power', 'desc')
    .$if(!address, (qb) => {
      return qb.selectAll();
    })
    .$if(typeof address !== 'undefined', (qb) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- previous line checks address is defined
      const buffer = Buffer.from(addressFromBech32m(address!).inner);
      const rewards = pindexerDb
        .selectFrom('lqt._delegator_rewards')
        .selectAll()
        .where('address', '=', buffer);

      return qb
        .leftJoin(rewards.as('rewards'), 'rewards.epoch', 'votes.epoch')
        .groupBy(['votes.epoch', 'rewards.address', 'votes.power', 'votes.asset_id'])
        .select((exp) => [
          'votes.epoch',
          'votes.power',
          'votes.asset_id',
          'rewards.address',
          exp.fn.sum(exp.ref('rewards.amount')).as('reward'),
        ])
    });

  const epochs = pindexerDb
    .selectFrom('lqt._finished_epochs as epochs')
    .orderBy('epoch', 'desc')
    .limit(limit)
    .offset(limit * (page - 1));

  const merged = epochs
    .leftJoin(votes.as('votes'), 'votes.epoch', 'epochs.epoch')
    .orderBy('epochs.epoch', 'desc')
    .groupBy('epochs.epoch')
    .select([
      'epochs.epoch',
      sql<AggregatedVotes[] | null>`json_agg(votes.*) FILTER (WHERE votes.epoch IS NOT NULL)`.as('votes'),
    ]);

  return merged.execute();
};

export async function GET(
  req: NextRequest,
): Promise<NextResponse<Serialized<PreviousEpochsApiResponse | { error: string }>>> {
  const chainId = process.env['PENUMBRA_CHAIN_ID'];
  if (!chainId) {
    return NextResponse.json({ error: 'PENUMBRA_CHAIN_ID is not set' }, { status: 500 });
  }

  const params = getQueryParams(req);

  const registryClient = new ChainRegistryClient();

  const [registry, results] = await Promise.all([
    registryClient.remote.get(chainId),
    previousEpochsQuery(params),
  ]);

  const mapped = results.map((result) => ({
    epoch: result.epoch,
    votes: (result.votes ?? []).map((vote) => {
      const asset = registry.tryGetMetadata(new AssetId({
        inner: Uint8Array.from(vote.asset_id),
      }));
      console.log('FILTER', asset, uint8ArrayToBase64(Uint8Array.from(vote.asset_id)), uint8ArrayToHex(Uint8Array.from(vote.asset_id)));

      if (!asset) {
        return undefined;
      }

      return {
        asset,
        epoch: vote.epoch,
        power: vote.power,
        address: new Address({ inner: Uint8Array.from(vote.address) }),
        reward: vote.reward,
      };
    }).filter(Boolean),
  }));

  return NextResponse.json(serialize(mapped));
}
