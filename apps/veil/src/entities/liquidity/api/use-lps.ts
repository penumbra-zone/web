import { penumbra } from '@/shared/const/penumbra';
import {
  TradingPair,
  PositionState,
  PositionId,
  PositionMetadata,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { AddressIndex } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { useQuery } from '@tanstack/react-query';
import { ViewService } from '@penumbra-zone/protobuf/penumbra/view/v1/view_connect';

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
      const result = penumbra.service(ViewService).lpPositionBundle({
        subaccount: new AddressIndex({ account: subaccount }),
        positionMetadata: new PositionMetadata({ strategy: 4, identifier: 0 }),
      });
      for await (const item of result) {
        console.log("item: ", item)
      }

      return result;
    },
  });

  console.log("strategyBundles: ", strategyBundles)
};
