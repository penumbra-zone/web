import { SliceCreator, useStore } from '..';
import { createZQuery, ZQueryState } from '@penumbra-zone/zquery';
import { penumbra } from '../../prax.ts';
import { ViewService } from '@penumbra-zone/protobuf/penumbra/view/v1/view_connect';
import {
  OwnedPositionIdsResponse,
  TransactionPlannerRequest,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { SwapSlice } from './index.ts';
import { isValidAmount, planBuildBroadcast } from '../helpers.ts';
import { getAddressIndex } from '@penumbra-zone/getters/address-view';
import { getAssetIdFromValueView } from '@penumbra-zone/getters/value-view';
import { PositionState_PositionStateEnum } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { base64ToUint8Array } from '@penumbra-zone/types/base64';

export const { ownedPositions, useOwnedPositions } = createZQuery({
  name: 'ownedPositions',
  fetch: () => penumbra.service(ViewService).ownedPositionIds({}),
  stream: () => {
    return {
      onValue: (
        prevState: OwnedPositionIdsResponse[] | undefined,
        response: OwnedPositionIdsResponse,
      ) => {
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
  ownedPositions: ZQueryState<OwnedPositionIdsResponse[]>;
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
