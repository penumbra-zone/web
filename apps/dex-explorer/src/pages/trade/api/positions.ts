import { DexService, ViewService } from '@penumbra-zone/protobuf';
import { penumbra } from '@/shared/const/penumbra';
import { connectionStore } from '@/shared/model/connection';
import { useQuery } from '@tanstack/react-query';
import {
  Position,
  PositionId,
  PositionState_PositionStateEnum,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { AssetId, ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { bech32mPositionId } from '@penumbra-zone/bech32m/plpid';
import { Amount } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';
import { registryQueryFn } from '@/shared/api/registry.ts';
import { isZero } from '@penumbra-zone/types/amount';

interface Order {
  side: 'Buy' | 'Sell';
  tradeAmount: ValueView;
  effectivePrice: ValueView;
}

interface PositionData {
  positionId: string;
  positionState: PositionStateStr;
  fee: number;
  orders: Order[];
}

const assetIdToValueView = async (assetId?: AssetId, amount?: Amount) => {
  if (!assetId) {
    throw new Error('No asset id found to convert to ValueView');
  }

  const registry = await registryQueryFn();
  const metadata = registry.tryGetMetadata(assetId);
  if (metadata) {
    return new ValueView({
      valueView: { case: 'knownAssetId', value: { amount, metadata } },
    });
  } else {
    return new ValueView({
      valueView: { case: 'unknownAssetId', value: { amount, assetId } },
    });
  }
};

const getOrders = async (position: Position): Promise<Order[]> => {
  const asset1Id = position.phi?.pair?.asset1;
  const asset1Amount = position.reserves?.r1;

  const asset2Id = position.phi?.pair?.asset2;
  const asset2Amount = position.reserves?.r2;

  const asset1IsPresent = asset1Amount && !isZero(asset1Amount);
  const asset2IsPresent = asset2Amount && !isZero(asset2Amount);

  // TODO: Properly calculate effectivePrice (need to subtract fee)

  // Sell order: Offering to sell asset1
  if (asset1IsPresent && !asset2IsPresent) {
    return [
      {
        side: 'Sell',
        tradeAmount: await assetIdToValueView(asset1Id, asset1Amount),
        effectivePrice: await assetIdToValueView(asset2Id, asset2Amount),
      },
    ];
  }

  // Buy order: Offering to buy asset1
  if (!asset1IsPresent && asset2IsPresent) {
    return [
      {
        side: 'Buy',
        tradeAmount: await assetIdToValueView(asset1Id, asset1Amount),
        effectivePrice: await assetIdToValueView(asset2Id, asset2Amount),
      },
    ];
  }

  // Mixed order: offering to sell both assets
  if (asset1IsPresent && asset2IsPresent) {
    return [
      {
        side: 'Sell',
        tradeAmount: await assetIdToValueView(asset1Id, asset1Amount),
        effectivePrice: await assetIdToValueView(asset2Id, asset2Amount),
      },
      {
        side: 'Sell',
        tradeAmount: await assetIdToValueView(asset2Id, asset2Amount),
        effectivePrice: await assetIdToValueView(asset1Id, asset1Amount),
      },
    ];
  }

  // If no valid orders are found, return an empty array
  return [];
};

const positionToDisplayData = async (id: PositionId, position: Position): Promise<PositionData> => {
  return {
    positionId: bech32mPositionId(id),
    positionState: stateToString(position.state?.state),
    fee: position.phi?.component?.fee ?? 0,
    orders: await getOrders(position),
  };
};

// 1) Query prax to get position ids
// 2) Take those position ids and get position info from the node
// Context on two-step fetching process: https://github.com/penumbra-zone/penumbra/pull/4837
const fetchQuery = async (): Promise<PositionData[]> => {
  const ownedRes = await Array.fromAsync(penumbra.service(ViewService).ownedPositionIds({}));
  const positionIds = ownedRes.map(r => r.positionId).filter(Boolean) as PositionId[];

  const positionsRes = await Array.fromAsync(
    penumbra.service(DexService).liquidityPositionsById({ positionId: positionIds }),
  );
  if (positionsRes.length !== ownedRes.length) {
    throw new Error('owned id array does not match the length of the positions response');
  }
  const positions = positionsRes.map(r => r.data).filter(Boolean) as Position[];

  const positionData: PositionData[] = [];
  // The responses are in the same order as the requests. Hence, the index matching.
  for (let i = 0; i < positions.length; i++) {
    const id = positionIds[i];
    const position = positions[i];
    if (!id || !position) {
      throw new Error(`No corresponding position or id for index ${i}`);
    }
    const data = await positionToDisplayData(id, position);
    positionData.push(data);
  }

  return positionData;
};

/**
 * Must be used within the `observer` mobX HOC
 */
export const usePositions = () => {
  return useQuery({
    queryKey: ['positions'],
    queryFn: fetchQuery,
    enabled: connectionStore.connected,
  });
};

type PositionStateStr = 'unspecified' | 'opened' | 'closed' | 'withdrawn' | 'claimed';

export const stateToString = (state?: PositionState_PositionStateEnum): PositionStateStr => {
  switch (state) {
    case PositionState_PositionStateEnum.UNSPECIFIED: {
      return 'unspecified';
    }
    case PositionState_PositionStateEnum.OPENED: {
      return 'opened';
    }
    case PositionState_PositionStateEnum.CLOSED: {
      return 'closed';
    }
    case PositionState_PositionStateEnum.WITHDRAWN: {
      return 'withdrawn';
    }
    case PositionState_PositionStateEnum.CLAIMED: {
      return 'claimed';
    }
    case undefined: {
      return 'unspecified';
    }
  }
};
