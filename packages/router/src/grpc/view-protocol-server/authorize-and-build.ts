import type { Impl } from '.';
import { servicesCtx } from '../../ctx';
import { optimisticBuild } from './util/build-tx';
import { custodyAuthorize } from './util/custody-authorize';
import { getWitness } from '@penumbra-zone/wasm';
import { Code, ConnectError } from '@connectrpc/connect';

export const authorizeAndBuild: Impl['authorizeAndBuild'] = async function* (
  { transactionPlan },
  ctx,
) {
  const services = ctx.values.get(servicesCtx);
  if (!transactionPlan) throw new ConnectError('No tx plan in request', Code.InvalidArgument);

  const {
    blockProcessor,
    indexedDb,
    viewServer: { fullViewingKey },
  } = await services.getWalletServices();

  // Retrieve a specific compact block and benchmark serialization costs
  let compact_block = await blockProcessor.retrieveCompactBlock(210745n)
  console.log("compact block is: ", compact_block)

  // Native JSON conversion
  const startTime = performance.now(); 
  for (let i = 0; i < 10000; i++) {
    compact_block!.toJson();
  }
  const endTime = performance.now();
  const executionTime = endTime - startTime; 
  console.log(`Native JSON conversion execution time: ${executionTime} milliseconds`);

  // Connect JSON conversion
  const startTime2 = performance.now(); 
  for (let i = 0; i < 10000; i++) {
    compact_block!.toJson();
  }
  const endTime2 = performance.now();
  const executionTime2 = endTime2 - startTime2; 
  console.log(`Connect JSON conversion execution time: ${executionTime2} milliseconds`);

  const sct = await indexedDb.getStateCommitmentTree();
  const witnessData = getWitness(transactionPlan, sct);

  yield* optimisticBuild(
    transactionPlan,
    witnessData,
    custodyAuthorize(ctx, transactionPlan),
    fullViewingKey,
  );
};
