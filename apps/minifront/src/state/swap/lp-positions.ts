import { SliceCreator, useStore } from '..';
import { createZQuery, ZQueryState } from '@penumbra-zone/zquery';
import { penumbra } from '../../prax.ts';
import { ViewService } from '@penumbra-zone/protobuf/penumbra/view/v1/view_connect';
import { OwnedPositionIdsResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';

interface Actions {}

interface State {
  ownedPositions: ZQueryState<OwnedPositionIdsResponse[]>;
}

export type LpPositionsSlice = Actions & State;

const INITIAL_STATE: State = {
  ownedPositions,
};

export const { ownedPositions, useOwnedPositions } = createZQuery({
  name: 'ownedPositions',
  fetch: penumbra.service(ViewService).ownedPositionIds({}),
  stream: () => {
    return {
      onValue: (prevState: OwnedPositionIdsResponse[], response: OwnedPositionIdsResponse) => {
        return [...prevState, response];
      },
    };
  },
  getUseStore: () => useStore,
  get: state => state.swap.lpPositions.ownedPositions,
  set: setter => {
    const newState = setter(useStore.getState().shared.balancesResponses);
    useStore.setState(state => {
      state.shared.balancesResponses = newState;
    });
  },
});

export const createLpPositionsSlice = (): SliceCreator<LpPositionsSlice> => (set, get) => {
  return {
    ...INITIAL_STATE,
  };
};
