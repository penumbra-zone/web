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
import { base64ToUint8Array } from '@penumbra-zone/types/base64';
import { DexService } from '@penumbra-zone/protobuf';
import { AssetId, ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { Amount } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';

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
  onSubmit: () => Promise<void>;
}

interface State {
  ownedPositions: ZQueryState<PositionWithId[]>;
}

export type LpPositionsSlice = Actions & State;

const INITIAL_STATE: State = {
  ownedPositions,
};

export const createLpPositionsSlice = (): SliceCreator<LpPositionsSlice> => (set, get) => {
  return {
    ...INITIAL_STATE,
    onSubmit: async () => {
      try {
        set(state => {
          state.swap.txInProgress = true;
        });

        const txPlannerRequest = assembleLimitOrderReq(get().swap);
        await planBuildBroadcast('positionOpen', txPlannerRequest);

        set(state => {
          state.swap.amount = '';
        });
        get().shared.balancesResponses.revalidate();
      } finally {
        set(state => {
          state.swap.txInProgress = false;
        });
      }
    },
  };
};

// TODO: This is temporary data for testing purposes. Update with inputs when component is ready.
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
    positionCloses: [
      {
        positionId: { inner: base64ToUint8Array('/C9cn0d8veH0IGt2SCghzfcCWkPWbgUDXpXOPgZyA8c=') },
      },
    ],
    positionWithdraws: [
      {
        positionId: { inner: base64ToUint8Array('+vbub7BbEAAKLqRorZbNZ4yixPNVFzGl1BAexym3mDc=') },
        reserves: { r1: { lo: 1000000n }, r2: {} },
        tradingPair: {
          asset1: getAssetIdFromValueView(assetIn.balanceView),
          asset2: assetOut.penumbraAssetId,
        },
      },
    ],
    source: getAddressIndex(assetIn.accountAddress),
  });
};
