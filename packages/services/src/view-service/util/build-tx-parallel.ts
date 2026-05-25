/**
 * Parallel transaction building using rayon thread pool via offscreen worker.
 *
 * This module provides an alternative to the standard offscreen-based parallel build
 * that uses wasm-bindgen-rayon for true multi-threaded WASM execution.
 *
 * Benefits:
 * - No JS worker overhead per action
 * - All actions build concurrently in WASM via rayon's par_iter()
 * - Better CPU utilization for multi-action transactions
 *
 * The rayon build happens in an offscreen worker because:
 * - Service workers have restrictions on spawning Web Workers
 * - Offscreen documents can spawn workers freely
 * - The offscreen worker initializes the rayon thread pool once and reuses it
 */

import {
  AuthorizationData,
  Transaction,
  TransactionPlan,
  WitnessData,
} from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import {
  AuthorizeAndBuildResponse,
  WitnessAndBuildResponse,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { PartialMessage } from '@bufbuild/protobuf';
import { ConnectError } from '@connectrpc/connect';
import { FullViewingKey } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { offscreenClient } from '../../offscreen-client.js';

/**
 * Check if parallel build is available.
 *
 * In the extension context, SharedArrayBuffer is only available in the
 * offscreen document (with cross-origin isolation), not in the service worker.
 * We return true if we're in an extension context, since the offscreen worker
 * will handle the actual SharedArrayBuffer check.
 *
 * For web contexts, we check for SharedArrayBuffer directly.
 */
export const isParallelBuildAvailable = (): boolean => {
  // In Chrome extension context, always return true - the offscreen document
  // has cross-origin isolation and SharedArrayBuffer support
  if (typeof chrome !== 'undefined' && chrome.runtime?.id) {
    return true;
  }

  // In web contexts, check for SharedArrayBuffer directly
  return typeof SharedArrayBuffer !== 'undefined';
};

/**
 * Optimistic parallel build using rayon via offscreen worker.
 *
 * @param transactionPlan - The transaction plan
 * @param witnessData - The witness data
 * @param authorizationRequest - Promise for authorization data
 * @param fvk - The full viewing key
 */
export const optimisticParallelBuild = async function* (
  transactionPlan: TransactionPlan,
  witnessData: WitnessData,
  authorizationRequest: PromiseLike<AuthorizationData>,
  fvk: FullViewingKey,
): AsyncGenerator<PartialMessage<AuthorizeAndBuildResponse | WitnessAndBuildResponse>> {
  // Cancel promise for auth denial
  const cancel = new Promise<never>(
    (_, reject) =>
      void Promise.resolve(authorizationRequest).catch((r: unknown) =>
        reject(ConnectError.from(r)),
      ),
  );

  // Track phases: auth -> build
  let authComplete = false;
  let authData: AuthorizationData | undefined;
  let buildComplete = false;
  let buildTransaction: Transaction | undefined;
  let buildError: unknown;

  // Start auth and track completion
  Promise.race([cancel, authorizationRequest])
    .then(data => {
      authData = data;
      authComplete = true;
    })
    .catch(() => {
      // cancel will handle rejection
    });

  const startTime = Date.now();
  const minAnimationMs = 500;

  // Helper to calculate progress based on phase and elapsed time
  // Phase 1 (auth): 0.05 -> 0.20 over ~2s
  // Phase 2 (build): 0.20 -> 0.90 over ~4s (WASM init + key loading + proof)
  const getProgress = (elapsed: number, phase: 'auth' | 'build'): number => {
    if (phase === 'auth') {
      // Slow rise from 5% to 20% - user is approving
      return 0.05 + 0.15 * (1 - 1 / (1 + elapsed / 2000));
    }
    // Build phase: 20% to 90% with slower curve for init-heavy first build
    // 3000ms time constant means ~50% at 3 seconds
    return 0.2 + 0.7 * (1 - 1 / (1 + elapsed / 3000));
  };

  // Phase 1: Animate while waiting for auth
  while (!authComplete) {
    const elapsed = Date.now() - startTime;
    yield {
      status: {
        case: 'buildProgress',
        value: { progress: getProgress(elapsed, 'auth') },
      },
    };
    await new Promise<void>(r => setTimeout(r, 50));
  }

  // Auth complete - start build
  if (!authData) {
    // Auth was cancelled/rejected
    await Promise.race([cancel, authorizationRequest]); // will throw
    return;
  }

  // Yield 20% to mark auth complete
  yield {
    status: {
      case: 'buildProgress',
      value: { progress: 0.2 },
    },
  };

  // Build all actions in parallel using rayon via offscreen worker
  // The worker handles WASM initialization and proving key loading
  const buildPromise = offscreenClient.buildParallelWithRayon(
    transactionPlan,
    witnessData,
    fvk,
    authData,
  );

  buildPromise
    .then(tx => {
      buildTransaction = tx;
      buildComplete = true;
    })
    .catch(e => {
      buildError = e;
      buildComplete = true;
    });

  // Phase 2: Animate while building
  const buildStartTime = Date.now();
  while (!buildComplete || Date.now() - buildStartTime < minAnimationMs) {
    const elapsed = Date.now() - buildStartTime;
    const progress = buildComplete ? 0.95 : Math.min(0.9, getProgress(elapsed, 'build'));

    yield {
      status: {
        case: 'buildProgress',
        value: { progress },
      },
    };

    await new Promise<void>(r => setTimeout(r, 50));
  }

  // Check for build error
  if (buildError) {
    throw ConnectError.from(buildError);
  }

  const transaction = buildTransaction ?? (await Promise.race([cancel, buildPromise]));

  yield {
    status: {
      case: 'complete',
      value: { transaction },
    },
  };
};
