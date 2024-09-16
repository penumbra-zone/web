import { SliceCreator, useStore } from '..';
import { createZQuery, ZQueryState } from '@penumbra-zone/zquery';
import { penumbra } from '../../prax.ts';
import { ViewService } from '@penumbra-zone/protobuf/penumbra/view/v1/view_connect';
import { TransactionPlannerRequest } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { SwapSlice } from './index.ts';
import { isValidAmount, planBuildBroadcast } from '../helpers.ts';
import { getAddressIndex } from '@penumbra-zone/getters/address-view';
import { getAssetIdFromValueView } from '@penumbra-zone/getters/value-view';
import {
  Position,
  PositionId,
  PositionState_PositionStateEnum,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { DexService } from '@penumbra-zone/protobuf';
import { AssetId, ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { Amount } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';
import { AddressIndex } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { getBalancesStream } from '../../fetchers/balances';
import { bech32mPositionId } from '@penumbra-zone/bech32m/plpid';
import { getMetadataFromBalancesResponse } from '@penumbra-zone/getters/balances-response';

export interface PositionWithId {
  id: PositionId;
  position: Position;
  r1ValueView: ValueView;
  r2ValueView: ValueView;
}

const toValueView = async (assetId?: AssetId, amount?: Amount) => {
  if (!assetId) {
    return new ValueView({
      valueView: { case: 'unknownAssetId', value: { amount, assetId } },
    });
  }

  const { denomMetadata } = await penumbra.service(ViewService).assetMetadataById({ assetId });
  if (denomMetadata) {
    return new ValueView({
      valueView: { case: 'knownAssetId', value: { amount, metadata: denomMetadata } },
    });
  } else {
    return new ValueView({
      valueView: { case: 'unknownAssetId', value: { amount, assetId } },
    });
  }
};

// Collects the stream of owned positions and then yields the positions results in a stream
const fetchOwnedPositions = async function* (): AsyncIterable<PositionWithId> {
  // We only care about opened and closed state. If withdrawn, not helpful to display in the UI.
  const openedIds = await Array.fromAsync(
    penumbra
      .service(ViewService)
      .ownedPositionIds({ positionState: { state: PositionState_PositionStateEnum.OPENED } }),
  );
  const closedIds = await Array.fromAsync(
    penumbra
      .service(ViewService)
      .ownedPositionIds({ positionState: { state: PositionState_PositionStateEnum.CLOSED } }),
  );

  const allPositionIds = [...openedIds, ...closedIds]
    .map(i => i.positionId)
    .filter(Boolean) as PositionId[];

  // We then need to retrieve the LP data for each of these ID's from the node
  const iterable = penumbra
    .service(DexService)
    .liquidityPositionsById({ positionId: allPositionIds });

  let index = 0;
  for await (const res of iterable) {
    const id = allPositionIds[index]; // responses are emitted in the order of the input ids
    if (!id) {
      throw new Error(`No corresponding ID in request array for position index ${index}`);
    }

    if (
      res.data &&
      // TODO: Bug w/ testnet whale seedphrase on penumbra-1 LP position
      //       https://dex.penumbra.sevenseas.capital/lp/plpid17wqat9ppwkjk8hffpk2jz669c3u5hzm8268jjlf6j88qju7d238qak905k
      //       Stored as an opened position in indexeddb, but when querying `liquidityPositionsById()`, it's actually already withdrawn
      //       Doing a temp additional filter here so users don't see that state.
      [PositionState_PositionStateEnum.OPENED, PositionState_PositionStateEnum.CLOSED].includes(
        res.data.state?.state ?? PositionState_PositionStateEnum.UNSPECIFIED,
      )
    ) {
      yield {
        id,
        position: res.data,
        r1ValueView: await toValueView(res.data.phi?.pair?.asset1, res.data.reserves?.r1),
        r2ValueView: await toValueView(res.data.phi?.pair?.asset2, res.data.reserves?.r2),
      };
    }

    index = index + 1;
  }
};

export const { ownedPositions, useOwnedPositions } = createZQuery({
  name: 'ownedPositions',
  fetch: fetchOwnedPositions,
  stream: () => {
    return {
      onValue: (prevState: PositionWithId[] | undefined, response: PositionWithId) => {
        return [...(prevState ?? []), response];
      },
    };
  },
  getUseStore: () => useStore,
  get: state => state.swap.lpPositions.ownedPositions,
  set: setter => {
    const newState = setter(useStore.getState().swap.lpPositions.ownedPositions);
    useStore.setState(state => {
      state.swap.lpPositions.ownedPositions = newState;
    });
  },
});

interface Actions {
  onAction: (action: 'positionClose' | 'positionWithdraw', p: PositionWithId) => Promise<void>;
  open: () => Promise<void>;
}

interface State {
  ownedPositions: ZQueryState<PositionWithId[]>;
}

export type LpPositionsSlice = Actions & State;

const INITIAL_STATE: State = {
  ownedPositions,
};

// TODO: This is a slow operation. We should revise LiquidityPositionsResponse to:
//       message LiquidityPositionsResponse {
//            Position data = 1;
//            // === new ===
//            PositionId position_id = 2;
//            SpendableNoteRecord note_record = 3;
//            ValueView r1_value_view = 4;
//            ValueView r2_value_view = 5;
// }
const getSourceForPosition = async (pId: PositionId): Promise<AddressIndex | undefined> => {
  const bech32Id = bech32mPositionId(pId);
  const responses = await Array.fromAsync(getBalancesStream());
  for (const r of responses) {
    const baseDenom = getMetadataFromBalancesResponse.optional(r)?.base;
    if (baseDenom?.includes(bech32Id)) {
      return getAddressIndex.optional(r.accountAddress);
    }
  }
  return undefined;
};

export const createLpPositionsSlice = (): SliceCreator<LpPositionsSlice> => (set, get) => {
  return {
    ...INITIAL_STATE,
    onAction: async (action, { id, position }) => {
      try {
        set(state => {
          state.swap.txInProgress = true;
        });

        const txPlannerRequest = await assembleReq(action, id, position);
        await planBuildBroadcast(action, txPlannerRequest);

        get().swap.lpPositions.ownedPositions.revalidate();
      } finally {
        set(state => {
          state.swap.txInProgress = false;
        });
      }
    },
    open: async () => {
      try {
        set(state => {
          state.swap.txInProgress = true;
        });

        const txPlannerRequest = assembleLimitOrderReq(get().swap);
        await planBuildBroadcast('positionOpen', txPlannerRequest);

        get().swap.lpPositions.ownedPositions.revalidate();
      } finally {
        set(state => {
          state.swap.txInProgress = false;
        });
      }
    },
  };
};

const assembleReq = async (action: string, positionId: PositionId, position: Position) => {
  const source = await getSourceForPosition(positionId);
  if (!source) {
    throw new Error(`Could not find source for ${bech32mPositionId(positionId)}`);
  }

  if (action === 'positionClose') {
    return new TransactionPlannerRequest({
      positionCloses: [{ positionId }],
      source,
    });
  }

  if (action === 'positionWithdraw') {
    return new TransactionPlannerRequest({
      positionWithdraws: [
        { positionId, reserves: position.reserves, tradingPair: position.phi?.pair },
      ],
      source,
    });
  }

  throw new Error(`Action not implemented: ${action}`);
};

const assembleLimitOrderReq = ({ assetIn, amount, assetOut }: SwapSlice) => {
  if (!assetIn) {
    throw new Error('`assetIn` is undefined');
  }
  if (!assetOut) {
    throw new Error('`assetOut` is undefined');
  }
  if (!isValidAmount(amount, assetIn)) {
    throw new Error('Invalid amount');
  }

  return new TransactionPlannerRequest({
    positionOpens: [
      {
        position: {
          phi: {
            component: { p: { lo: 1000000n }, q: { lo: 1000000n } },
            pair: {
              asset1: getAssetIdFromValueView(assetIn.balanceView),
              asset2: assetOut.penumbraAssetId,
            },
          },
          nonce: crypto.getRandomValues(new Uint8Array(32)),
          state: { state: PositionState_PositionStateEnum.OPENED },
          reserves: { r1: { lo: 1n }, r2: {} },
          closeOnFill: true,
        },
      },
    ],
    source: getAddressIndex(assetIn.accountAddress),
  });
};
