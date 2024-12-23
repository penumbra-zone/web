import { SliceCreator, useStore } from '.';
import { SwapRecord } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { issueSwapClaim } from './swap/instant-swap';
import { getSwapRecordCommitment } from '@penumbra-zone/getters/swap-record';
import { createZQuery, ZQueryState } from '@penumbra-zone/zquery';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { fetchUnclaimedSwaps } from '../fetchers/unclaimed-swaps';
import { ViewService } from '@penumbra-zone/protobuf';
import { penumbra } from '../penumbra';

type SwapCommitmentId = string;

export interface UnclaimedSwapsWithMetadata {
  swap: SwapRecord;
  asset1: Metadata;
  asset2: Metadata;
}

export interface UnclaimedSwapsSlice {
  inProgress: SwapCommitmentId[];
  isInProgress: (id: SwapCommitmentId) => boolean;
  setProgressStatus: (action: 'add' | 'remove', id: SwapCommitmentId) => void;
  claimSwap: (id: SwapCommitmentId, swap: SwapRecord) => Promise<void>;
  unclaimedSwaps: ZQueryState<UnclaimedSwapsWithMetadata[]>;
}

export const { unclaimedSwaps, useUnclaimedSwaps, useRevalidateUnclaimedSwaps } = createZQuery({
  name: 'unclaimedSwaps',
  fetch: fetchUnclaimedSwaps,

  getUseStore: () => useStore,

  set: setter => {
    const newState = setter(useStore.getState().unclaimedSwaps.unclaimedSwaps);

    useStore.setState(state => {
      Object.assign(state.unclaimedSwaps.unclaimedSwaps, newState);
    });
  },

  get: state => state.unclaimedSwaps.unclaimedSwaps,
});

export const createUnclaimedSwapsSlice = (): SliceCreator<UnclaimedSwapsSlice> => (set, get) => ({
  inProgress: [],
  isInProgress: id => {
    return get().unclaimedSwaps.inProgress.includes(id);
  },
  setProgressStatus: (action, id) => {
    if (action === 'add') {
      if (get().unclaimedSwaps.isInProgress(id)) {
        return;
      }
      set(({ unclaimedSwaps: { inProgress } }) => {
        inProgress.push(id);
      });
    }
    if (action === 'remove') {
      set(({ unclaimedSwaps }) => {
        unclaimedSwaps.inProgress = get().unclaimedSwaps.inProgress.filter(item => item !== id);
      });
    }
  },
  claimSwap: async (id, swap) => {
    const setStatus = get().unclaimedSwaps.setProgressStatus;
    setStatus('add', id);

    const commitment = getSwapRecordCommitment(swap);

    const { addressIndex } = await penumbra.service(ViewService).indexByAddress({
      address: swap.swap?.claimAddress,
    });
    await issueSwapClaim(commitment, addressIndex);
    setStatus('remove', id);
    get().unclaimedSwaps.unclaimedSwaps.revalidate();
  },
  unclaimedSwaps,
});
