import { AllSlices, SliceCreator } from './index';
import { SwapRecord } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { buildingTxToast, errorTxToast } from '../components/shared/toast-content.tsx';
import { getSwapRecordCommitment } from '@penumbra-zone/types';
import { issueSwapClaim } from './swap.ts';

type SwapCommitmentId = string;

export interface UnclaimedSwapsSlice {
  inProgress: SwapCommitmentId[];
  isInProgress: (id: SwapCommitmentId) => boolean;
  setProgressStatus: (action: 'add' | 'remove', id: SwapCommitmentId) => void;
  claimSwap: (
    id: SwapCommitmentId,
    swap: SwapRecord,
    reloadData: () => void, // Used to refresh page state after action
  ) => Promise<void>;
}

export const createUnclaimedSwapsSlice = (): SliceCreator<UnclaimedSwapsSlice> => (set, get) => {
  return {
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
      const toastId = buildingTxToast(undefined, undefined, 'Building swap claim transaction');

      const setStatus = get().unclaimedSwaps.setProgressStatus;
      setStatus('add', id);

      try {
        const commitment = getSwapRecordCommitment(swap);
        await issueSwapClaim(commitment, toastId);
      } catch (e) {
        errorTxToast(e, toastId);
        throw e;
      } finally {
        setStatus('remove', id);
        reloadData();
      }
    },
  };
};

export const unclaimedSwapsSelector = (state: AllSlices) => state.unclaimedSwaps;
