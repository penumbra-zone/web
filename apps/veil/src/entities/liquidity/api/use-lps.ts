import { penumbra } from '@/shared/const/penumbra';
import {
  TradingPair,
  PositionState,
  PositionId,
  PositionMetadata,
  Position,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { AddressIndex } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { useQuery } from '@tanstack/react-query';
import { ViewService } from '@penumbra-zone/protobuf/penumbra/view/v1/view_connect';
import { LpPositionBundleResponse_Entry } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { DexService } from '@penumbra-zone/protobuf';
import { bech32mPositionId } from '@penumbra-zone/bech32m/plpid';

export interface LpPositionBundleResponse {
  entries: LpPositionBundleResponseEntry[];
}

export interface LpPositionBundleResponseEntry {
  // The trading pair for which this strategy is defined.
  trading_pair: TradingPair;

  // The subaccount index for which this strategy is defined.
  subaccount: AddressIndex;

  // The LP strategy metadata.
  // position_metadata: PositionMetadata;
  position_metadata: 'Pyramid' | 'Inverted Pyramid' | 'Flat' | null;

  // The strategy state (e.g., open, closed, etc.).
  position_state: PositionState;

  // The position id(s) for the LP strategy.
  position_id: PositionId[];
}

/**
 * Must be used within the `observer` mobX HOC
 */
export const useLps = ({ subaccount }: { subaccount: number }) => {
  const { data: strategyBundles } = useQuery({
    queryKey: ['lp-position-bundle', subaccount],
    queryFn: async () => {
      const stream = penumbra.service(ViewService).lpPositionBundle({
        subaccount: new AddressIndex({ account: subaccount }),
        positionMetadata: new PositionMetadata({ strategy: 4, identifier: 0 }),
      });

      const entries: LpPositionBundleResponse_Entry[] = [];
      for await (const response of stream) {
        entries.push(...response.entries);
      }

      const positionIds: PositionId[] = entries.flatMap(entry => entry.positionId).filter(Boolean);

      const positionsRes = await Array.fromAsync(
        penumbra.service(DexService).liquidityPositionsById({ positionId: positionIds }),
      );

      const fullPositions = positionsRes.map(res => res.data).filter(Boolean) as Position[];

      const positionMap = new Map<string, Position>();
      positionIds.forEach((id, idx) => {
        const encoded = bech32mPositionId(id);
        positionMap.set(encoded, fullPositions[idx]!);
      });

      // TODO: Append trading pair information from the full node to the LP strategy
      // bundles fetched from prax. First, collect all PositionIds from the
      // streamed strategy bundles.y

      return entries;
    },
  });

  return strategyBundles;
};
