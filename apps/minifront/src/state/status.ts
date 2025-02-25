import { AbridgedZQueryState, ZQueryState } from '@penumbra-zone/zquery/src/types';
import { AllSlices, SliceCreator, useStore } from '.';
import { createZQuery } from '@penumbra-zone/zquery';
import { getInitialStatus, getStatusStream } from '../fetchers/status';
import {
  StatusResponse,
  StatusStreamResponse,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { PlainMessage, toPlainMessage } from '@bufbuild/protobuf';

// Time in milliseconds to wait before attempting to reconnect the status stream
const RECONNECT_TIMEOUT = 5_000;

export interface StatusStreamState {
  error?: unknown;
  running: boolean;
  timer?: ReturnType<typeof setTimeout>;
  scheduleReconnect: () => void;
  setStreamError: (error: unknown) => void;
  setStreamRunning: () => void;
}

export interface StatusSlice {
  initialStatus: ZQueryState<PlainMessage<StatusResponse>>;
  status: ZQueryState<PlainMessage<StatusStreamResponse>>;
  streamState: StatusStreamState;
}

export const { initialStatus, useInitialStatus, useRevalidateInitialStatus } = createZQuery({
  name: 'initialStatus',
  fetch: async () => toPlainMessage(await getInitialStatus()),
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
      prevData: PlainMessage<StatusStreamResponse> | undefined,
      item: PlainMessage<StatusStreamResponse>,
    ): PlainMessage<StatusStreamResponse> => {
      console.debug('status stream onValue', { prevData, item });
      // Mark the stream as running whenever we receive a value
      useStore.getState().status.streamState.setStreamRunning();

      return {
        ...prevData,
        ...item,
      };
    },
    onError: (prevData, error) => {
      console.debug('status stream onError', prevData, error);
      useStore.getState().status.streamState.setStreamError(error);
      return prevData;
    },
    onAbort: prevData => {
      console.debug('status stream onAbort', prevData);
      return prevData;
    },
    onEnd: prevData => {
      console.debug('status stream onEnd', prevData);
      useStore.getState().status.streamState.scheduleReconnect();
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

      scheduleReconnect: () => {
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

export const syncPercentSelector = (
  zQueryState: AbridgedZQueryState<PlainMessage<StatusStreamResponse>>,
) => {
  const { fullSyncHeight, latestKnownBlockHeight } = { ...zQueryState.data };

  let percentSyncedNumber = 0;
  if (latestKnownBlockHeight) {
    percentSyncedNumber = Number(fullSyncHeight) / Number(latestKnownBlockHeight);
    if (percentSyncedNumber > 1) {
      percentSyncedNumber = 1;
    }
  }

  // Round down to ensure whole numbers
  const roundedPercentSyncedNumber = Math.floor(percentSyncedNumber * 100);

  return {
    ...zQueryState,
    percentSyncedNumber: roundedPercentSyncedNumber / 100,
    percentSynced: `${roundedPercentSyncedNumber}%`,
  };
};
