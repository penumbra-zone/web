import {
  AuthorizeAndBuildRequest,
  BroadcastTransactionRequest,
  TransactionPlannerRequest,
  WitnessAndBuildRequest,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { viewClient } from '../clients/grpc.ts';
import { uint8ArrayToHex } from '@penumbra-zone/types';
import { sha256Hash } from '@penumbra-zone/crypto-web';
import {
  Transaction,
  TransactionPlan,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import { TransactionId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/txhash/v1/txhash_pb';
import { ToastFnProps } from '@penumbra-zone/ui/components/ui/use-toast';
import { broadcastingTxToast, buildingTxToast } from '../components/shared/toast-content.tsx';
import { PartialMessage } from '@bufbuild/protobuf';

export const plan = async (
  req: PartialMessage<TransactionPlannerRequest>,
): Promise<TransactionPlan> => {
  const { plan } = await viewClient.transactionPlanner(req);
  if (!plan) throw new Error('No plan in planner response');
  return plan;
};

export const authWitnessBuild = async (
  toastUp: (tp: ToastFnProps) => void,
  req: PartialMessage<AuthorizeAndBuildRequest>,
) => {
  for await (const { status } of viewClient.authorizeAndBuild(req)) {
    toastUp(buildingTxToast(status));
    switch (status.case) {
      case undefined:
      case 'buildProgress':
        break;
      case 'complete':
        return status.value.transaction!;
      default:
        console.warn('unknown authorizeAndBuild status', status);
    }
  }
  throw new Error('did not build transaction');
};

export const witnessBuild = async (
  toastUp: (tp: ToastFnProps) => void,
  req: PartialMessage<WitnessAndBuildRequest>,
) => {
  for await (const { status } of viewClient.witnessAndBuild(req)) {
    toastUp(buildingTxToast(status));
    switch (status.case) {
      case undefined:
      case 'buildProgress':
        break;
      case 'complete':
        return status.value.transaction!;
      default:
        console.warn('unknown witnessAndBuild status', status);
    }
  }
  throw new Error('did not build transaction');
};

export const broadcast = async (
  toastUp: (tp: ToastFnProps) => void,
  req: PartialMessage<BroadcastTransactionRequest>,
): Promise<{ txHash: string; detectionHeight?: bigint }> => {
  const { awaitDetection, transaction } = req;
  if (!transaction) throw new Error('no transaction');
  const txId = await getTxId(transaction);
  const txHash = getTxHash(txId);
  toastUp(broadcastingTxToast(txHash));
  for await (const { status } of viewClient.broadcastTransaction({ awaitDetection, transaction })) {
    if (!txId.equals(status.value?.id)) throw new Error('unexpected transaction id');
    toastUp(broadcastingTxToast(txHash, status));
    switch (status.case) {
      case 'broadcastSuccess':
        if (!awaitDetection) return { txHash, detectionHeight: undefined };
        break;
      case 'confirmed':
        return { txHash, detectionHeight: status.value.detectionHeight };
      default:
        console.warn(`unknown broadcastTransaction status: ${status.case}`);
    }
  }
  // TODO: detail broadcastSuccess status
  throw new Error('did not broadcast transaction');
};

export const getTxHash = <
  T extends Required<PartialMessage<TransactionId>> | PartialMessage<Transaction>,
>(
  t: T,
): T extends Required<PartialMessage<TransactionId>> ? string : Promise<string> =>
  'inner' in t && t.inner instanceof Uint8Array
    ? (uint8ArrayToHex(t.inner) as T extends Required<PartialMessage<TransactionId>>
        ? string
        : never)
    : (getTxId(t as PartialMessage<Transaction>).then(({ inner }) =>
        uint8ArrayToHex(inner),
      ) as T extends Required<PartialMessage<TransactionId>> ? never : Promise<string>);

export const getTxId = (tx: Transaction | PartialMessage<Transaction>) =>
  sha256Hash(tx instanceof Transaction ? tx.toBinary() : new Transaction(tx).toBinary()).then(
    inner => new TransactionId({ inner }),
  );
