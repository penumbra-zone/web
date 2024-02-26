import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { TransactionToast } from './transaction-toast';
import { Link } from 'react-router-dom';
import {
  AuthorizeAndBuildResponse,
  BroadcastTransactionResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { Progress } from '../../components/ui/progress';

const TOAST_FN_PROPERTIES = vi.hoisted(
  () => ['success', 'info', 'warning', 'error', 'message', 'dismiss', 'loading'] as const,
);

const MOCK_TOAST_ID = vi.hoisted(() => 1);

type MockWithToastFnProperties = Mock & Record<(typeof TOAST_FN_PROPERTIES)[number], Mock>;

const mockToastFn = vi.hoisted<MockWithToastFnProperties>(() => {
  const mock = vi.fn().mockReturnValue(1) as MockWithToastFnProperties;
  TOAST_FN_PROPERTIES.forEach(
    property => (mock[property] = vi.fn().mockReturnValue(MOCK_TOAST_ID)),
  );

  return mock;
});

vi.mock('sonner', async () => ({
  ...(await vi.importActual('sonner')),
  toast: mockToastFn,
}));

describe('TransactionToast', () => {
  beforeEach(() => {
    mockToastFn.mockClear();
    TOAST_FN_PROPERTIES.forEach(property => mockToastFn[property].mockClear());
  });

  describe('.onStart()', () => {
    it('shows a toast with a building status', () => {
      const toast = new TransactionToast('send');
      toast.onStart();

      expect(mockToastFn.loading).toHaveBeenCalledWith(
        'Building Send transaction',
        expect.objectContaining({
          duration: Infinity,
        }),
      );
    });
  });

  describe('.onBuildStatus()', () => {
    it('updates the toast to indicate that it is building', () => {
      const toast = new TransactionToast('send');
      toast.onStart();

      const buildStatus = new AuthorizeAndBuildResponse({
        status: {
          case: 'buildProgress',
          value: { progress: 0.5 },
        },
      }).status;

      toast.onBuildStatus(buildStatus);

      expect(mockToastFn.loading).toHaveBeenCalledWith(
        'Building Send transaction',
        expect.objectContaining({
          description: (
            <Progress
              status='in-progress'
              background='stone'
              value={50}
              size='sm'
              className='mt-2'
            />
          ),
          duration: Infinity,
          id: MOCK_TOAST_ID,
        }),
      );
    });

    it('updates the toast when it is done building', () => {
      const toast = new TransactionToast('send');
      toast.onStart();

      const buildStatus = new AuthorizeAndBuildResponse({
        status: {
          case: 'complete',
          value: {},
        },
      }).status;

      toast.onBuildStatus(buildStatus);

      expect(mockToastFn.loading).toHaveBeenCalledWith(
        'Building Send transaction',
        expect.objectContaining({
          description: <Progress status='done' value={100} size='sm' className='mt-2' />,
          duration: Infinity,
          id: MOCK_TOAST_ID,
        }),
      );
    });
  });

  describe('.onBroadcastStatus()', () => {
    it('updates the toast to indicate that it is broadcasting', () => {
      const toast = new TransactionToast('send');
      toast.onStart();

      const broadcastStatus = new BroadcastTransactionResponse({
        status: {
          case: undefined,
        },
      }).status;

      toast.onBroadcastStatus(broadcastStatus);

      expect(mockToastFn.loading).toHaveBeenCalledWith(
        'Emitting Send transaction',
        expect.objectContaining({
          description: '',
          duration: Infinity,
          id: MOCK_TOAST_ID,
        }),
      );
    });

    it('includes the transaction hash in the description if one has been set', () => {
      const toast = new TransactionToast('send');
      toast.onStart();
      toast.txHash('abc123');

      const broadcastStatus = new BroadcastTransactionResponse({
        status: {
          case: undefined,
        },
      }).status;

      toast.onBroadcastStatus(broadcastStatus);

      expect(mockToastFn.loading).toHaveBeenCalledWith(
        'Emitting Send transaction',
        expect.objectContaining({
          description: 'abc123',
        }),
      );
    });
  });

  describe('.onSuccess()', () => {
    it('updates the toast with the success status and a link to the transaction', () => {
      const toast = new TransactionToast('send');
      toast.onStart();
      toast.txHash('abc123');
      toast.onSuccess(1n);

      expect(mockToastFn.success).toHaveBeenCalledWith(
        'Send transaction succeeded! 🎉',
        expect.objectContaining({
          duration: Infinity,
          closeButton: true,
          description: 'Transaction abc123 appeared on chain at height 1.',
          action: {
            label: <Link to='/tx/abc123'>See details</Link>,
            onClick: expect.any(Function) as unknown,
          },
          id: MOCK_TOAST_ID,
        }),
      );
    });

    it('throws if no txHash was previously set', () => {
      const toast = new TransactionToast('send');
      toast.onStart();

      expect(() => toast.onSuccess(1n)).toThrow(
        'You called TransactionToast.onSuccess() without first calling `TransactionToast.txHash()`. You must first call `TransactionToast.txHash()` with the transaction hash, so that the success toast can construct a link to the transaction.',
      );
    });
  });

  describe('.onFailure()', () => {
    it('updates the toast to show the error', () => {
      const toast = new TransactionToast('send');
      toast.onStart();
      toast.onFailure(new Error('oops!'));

      expect(mockToastFn.error).toHaveBeenCalledWith(
        'Send transaction failed',
        expect.objectContaining({
          duration: Infinity,
          closeButton: true,
          description: 'Error: oops!',
          id: MOCK_TOAST_ID,
        }),
      );
    });
  });

  describe('.onDenied()', () => {
    it('updates the toast to indicate that the transaction was canceled', () => {
      const toast = new TransactionToast('send');
      toast.onStart();
      toast.onDenied();

      expect(mockToastFn.info).toHaveBeenCalledWith(
        'Transaction canceled',
        expect.objectContaining({
          duration: 5_000,
          id: MOCK_TOAST_ID,
        }),
      );
    });
  });
});
