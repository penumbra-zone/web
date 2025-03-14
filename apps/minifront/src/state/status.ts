import { AbridgedZQueryState, ZQueryState } from '@penumbra-zone/zquery/src/types';
import { AllSlices, SliceCreator, useStore } from '.';
import { createZQuery } from '@penumbra-zone/zquery';
import { getInitialStatus, getStatusStream } from '../fetchers/status';
import {
  StatusResponse,
  StatusStreamResponse,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';

// Time in milliseconds to wait before attempting to reconnect the status stream
const RECONNECT_TIMEOUT = 5_000;

export interface StatusStreamState {
  error?: unknown;
  running: boolean;
  timer?: ReturnType<typeof setTimeout>;
  scheduleRefetch: () => void;
  setStreamError: (error: unknown) => void;
  setStreamRunning: () => void;
}

export interface StatusSlice {
  initialStatus: ZQueryState<StatusResponse>;
  status: ZQueryState<StatusStreamResponse>;
  streamState: StatusStreamState;
}

export const { initialStatus, useInitialStatus, useRevalidateInitialStatus } = createZQuery({
  name: 'initialStatus',
  fetch: getInitialStatus,
  getUseStore: () => useStore,
  get: state => state.status.initialStatus,
  set: setter => {
    const newState = setter(useStore.getState().status.initialStatus);
    useStore.setState(state => {
      state.status.initialStatus = newState;
    });
  },
});

export const { status, useStatus, useRevalidateStatus } = createZQuery({
  name: 'status',
  fetch: getStatusStream,
  stream: () => ({
    onValue: (
      prevData: StatusStreamResponse | undefined,
      item: StatusStreamResponse,
    ): StatusStreamResponse => {
      useStore.getState().status.streamState.setStreamRunning();
      return {
        ...prevData,
        ...item,
      };
    },
    onError: (prevData, error) => {
      console.warn('Status stream error', error);
      useStore.getState().status.streamState.setStreamError(error);
      return prevData;
    },
    onEnd: prevData => {
      useStore.getState().status.streamState.scheduleRefetch();
      return prevData;
    },
  }),
  getUseStore: () => useStore,
  get: state => state.status.status,
  set: setter => {
    const newState = setter(useStore.getState().status.status);
    useStore.setState(state => {
      state.status.status = newState;
    });
  },
});

export const createStatusSlice = (): SliceCreator<StatusSlice> => (set, get) => {
  return {
    initialStatus, // zquery initialStatus object
    status, // zquery status object
    streamState: {
      error: undefined,
      running: false,
      timer: undefined,

      setStreamError: (error: unknown) => {
        set(state => {
          state.status.streamState.error = error;
        });
      },

      setStreamRunning: () => {
        clearTimeout(get().status.streamState.timer);

        set(state => {
          state.status.streamState.error = undefined;
          state.status.streamState.running = true;
          state.status.streamState.timer = undefined;
        });
      },

      scheduleRefetch: () => {
        clearTimeout(get().status.streamState.timer);

        const timer = setTimeout(() => {
          const { streamState, status } = get().status;
          if (!streamState.running) {
            status.revalidate();
          }
        }, RECONNECT_TIMEOUT);

        set(state => {
          state.status.streamState.timer = timer;
          state.status.streamState.running = false;
        });
      },
    },
  };
};

export const statusStreamStateSelector = ({ status }: AllSlices) => ({
  error: status.streamState.error,
  running: status.streamState.running,
});

export const syncPercentSelector = (zQueryState: AbridgedZQueryState<StatusStreamResponse>) => {
  const { fullSyncHeight, latestKnownBlockHeight } = { ...zQueryState.data };

  const synced =
    Number(latestKnownBlockHeight ?? 0) &&
    Math.min(1, Number(fullSyncHeight) / Number(latestKnownBlockHeight));

  const roundedPercentSyncedNumber = Math.floor(synced * 100);

  return {
    ...zQueryState,
    percentSyncedNumber: roundedPercentSyncedNumber / 100,
    percentSynced: `${roundedPercentSyncedNumber}%`,
  };
};
