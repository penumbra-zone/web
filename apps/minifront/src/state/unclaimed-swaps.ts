import { AllSlices, SliceCreator, useStore } from '.';
import { SwapRecord } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { issueSwapClaim } from './swap/instant-swap';
import { getSwapRecordCommitment } from '@penumbra-zone/getters/swap-record';
import { ZQueryState, createZQuery } from '../lib/z-query';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { fetchUnclaimedSwaps } from '../fetchers/unclaimed-swaps';

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
  claimSwap: (
    id: SwapCommitmentId,
    swap: SwapRecord,
    reloadData: () => void, // Used to refresh page state after action
  ) => Promise<void>;
  unclaimedSwaps: ZQueryState<UnclaimedSwapsWithMetadata[]>;
}

export const { unclaimedSwaps, useRevalidateUnclaimedSwaps, useUnclaimedSwaps } = createZQuery(
  'unclaimedSwaps',
  fetchUnclaimedSwaps,
  newValue =>
    useStore.setState(state => {
      Object.assign(state.unclaimedSwaps.unclaimedSwaps, newValue);
    }),
  (state: AllSlices) => state.unclaimedSwaps.unclaimedSwaps,
);

export const createUnclaimedSwapsSlice =
  (): SliceCreator<UnclaimedSwapsSlice> => (set, get, store) => ({
    inProgress: [],
    isInProgress: id => {
      return get().unclaimedSwaps.inProgress.includes(id);
    },
    setProgressStatus: (action, id) => {
      if (action === 'add') {
        if (get().unclaimedSwaps.isInProgress(id)) return;
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
    claimSwap: async (id, swap, reloadData) => {
      const setStatus = get().unclaimedSwaps.setProgressStatus;
      setStatus('add', id);

      const commitment = getSwapRecordCommitment(swap);
      await issueSwapClaim(commitment);
      setStatus('remove', id);
      reloadData();
    },
    unclaimedSwaps: unclaimedSwaps(store),
  });
