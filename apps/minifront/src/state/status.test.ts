import { describe, expect, test, vi } from 'vitest';
import { useStore } from '.';
import { syncPercentSelector } from './status';
import { PlainMessage } from '@bufbuild/protobuf';
import { StatusStreamResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';

describe('Status Slice', () => {
  describe('stream state', () => {
    test('setStreamError updates error state', () => {
      const { streamState } = useStore.getState().status;
      const testError = new Error('Test error');

      streamState.setStreamError(testError);

      expect(useStore.getState().status.streamState.error).toBe(testError);
    });

    test('setStreamRunning updates running state', () => {
      const { streamState } = useStore.getState().status;

      // Set a timer to ensure it gets cleared
      const mockTimer = setTimeout(() => {}, 1000);
      useStore.setState(state => {
        state.status.streamState.timer = mockTimer;
      });

      streamState.setStreamRunning();

      const newStreamState = useStore.getState().status.streamState;
      expect(newStreamState.running).toBe(true);
      expect(newStreamState.error).toBeUndefined();
      expect(newStreamState.timer).toBeUndefined();
    });

    test('scheduleRefetch sets timer and updates running state', () => {
      vi.useFakeTimers();

      const revalidateMock = vi.fn<[], void>();

      useStore.setState(state => {
        state.status.status.revalidate = revalidateMock;
      });

      const { streamState } = useStore.getState().status;

      streamState.scheduleRefetch();

      // Should have set timer and running state to false
      expect(useStore.getState().status.streamState.timer).toBeDefined();
      expect(useStore.getState().status.streamState.running).toBe(false);

      // Advance timers to trigger the reconnect
      vi.advanceTimersByTime(5000);

      // Should have called revalidate
      expect(revalidateMock).toHaveBeenCalled();

      vi.useRealTimers();
    });

    test('scheduleRefetch does not call revalidate if stream is running', () => {
      vi.useFakeTimers();

      const revalidateMock = vi.fn<[], void>();

      useStore.setState(state => {
        state.status.status.revalidate = revalidateMock;
      });

      const { streamState } = useStore.getState().status;

      // Set the stream as running
      useStore.setState(state => {
        state.status.streamState.running = true;
      });

      streamState.scheduleRefetch();

      vi.advanceTimersByTime(1000);

      // oops it's running again
      useStore.setState(state => {
        state.status.streamState.running = true;
      });

      // Advance timers
      vi.advanceTimersByTime(4000);

      // Should not have called revalidate
      expect(revalidateMock).not.toHaveBeenCalled();

      vi.useRealTimers();
    });
  });

  describe('sync percent', () => {
    test('syncPercentSelector calculates percentage correctly', () => {
      const mockState: PlainMessage<StatusStreamResponse> = {
        fullSyncHeight: 75n,
        partialSyncHeight: 75n,
        latestKnownBlockHeight: 100n,
      };

      const result = syncPercentSelector({
        data: mockState,
        loading: false,
      });

      expect(result.percentSyncedNumber).toBe(0.75);
      expect(result.percentSynced).toBe('75%');
    });

    test('syncPercentSelector handles undefined data', () => {
      const result = syncPercentSelector({
        data: undefined,
        loading: false,
      });

      expect(result.percentSyncedNumber).toBe(0);
      expect(result.percentSynced).toBe('0%');
    });

    test('syncPercentSelector caps percentage at 100%', () => {
      const mockState: PlainMessage<StatusStreamResponse> = {
        fullSyncHeight: 120n, // Higher than latest block
        partialSyncHeight: 120n,
        latestKnownBlockHeight: 100n,
      };

      const result = syncPercentSelector({
        data: mockState,
        loading: false,
      });

      expect(result.percentSyncedNumber).toBe(1);
      expect(result.percentSynced).toBe('100%');
    });

    test('syncPercentSelector rounds down to whole numbers', () => {
      const mockState: PlainMessage<StatusStreamResponse> = {
        fullSyncHeight: 761n,
        partialSyncHeight: 761n,
        latestKnownBlockHeight: 1000n,
      };

      const result = syncPercentSelector({
        data: mockState,
        loading: false,
      });

      // Would be 76.1% but rounds down to 76%
      expect(result.percentSyncedNumber).toBe(0.76);
      expect(result.percentSynced).toBe('76%');
    });
  });
});
