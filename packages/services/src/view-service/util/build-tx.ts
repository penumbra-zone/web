import {
  AuthorizationData,
  Transaction,
  TransactionPlan,
  WitnessData,
} from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { buildParallel } from '@penumbra-zone/wasm/build';
import { launchActionWorkers, taskProgress } from './parallel.js';
import {
  AuthorizeAndBuildResponse,
  WitnessAndBuildResponse,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { PartialMessage } from '@bufbuild/protobuf';
import { ConnectError } from '@connectrpc/connect';
import { FullViewingKey } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';

export const optimisticBuild = async function* (
  transactionPlan: TransactionPlan,
  witnessData: WitnessData,
  authorizationRequest: Promise<AuthorizationData>,
  fvk: FullViewingKey,
): AsyncGenerator<PartialMessage<AuthorizeAndBuildResponse | WitnessAndBuildResponse>> {
  const ac = new AbortController();
  void authorizationRequest.catch((r: unknown) => ac.abort(ConnectError.from(r)));

  // kick off the workers
  const actionBuilds = launchActionWorkers(transactionPlan, witnessData, fvk, ac.signal);

  // yield status updates as builds complete
  for await (const progress of taskProgress(
    actionBuilds,
    ac.signal,
    1, // offset to represent the final step
  )) {
    yield {
      status: {
        case: 'buildProgress',
        value: { progress },
      },
    };
  }

  // collect everything and execute final step
  const transaction: Transaction = buildParallel(
    await Promise.all(actionBuilds),
    transactionPlan,
    witnessData,
    await authorizationRequest,
  );

  yield {
    status: {
      case: 'complete',
      value: { transaction },
    },
  };
};
