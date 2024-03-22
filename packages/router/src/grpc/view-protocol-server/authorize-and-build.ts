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
  let compact_block = (await blockProcessor.retrieveCompactBlock(210745n))!;
  console.log("compact block is: ", compact_block)

  // Native JSON conversion
  const startTime = performance.now();
  for (let i = 0; i < 10000; i++) {
    JSON.stringify(compact_block);
  }
  const endTime = performance.now();
  const executionTime = endTime - startTime;
  console.log(`Native JSON conversion execution time: ${executionTime} milliseconds`);

  // Connect JSON conversion
  const startTime2 = performance.now();
  for (let i = 0; i < 10000; i++) {
    compact_block.toJson();
  }
  const endTime2 = performance.now();
  const executionTime2 = endTime2 - startTime2;
  console.log(`pb JSON conversion execution time: ${executionTime2} milliseconds`);

  // Make a "clean" object without any connect tainting in its definitions
  let cbj = JSON.stringify(compact_block);
  let cb2 = JSON.parse(cbj);
  console.log("cb2 is: ", cb2)

  const startTime3 = performance.now();
  for (let i = 0; i < 10000; i++) {
    JSON.stringify(cb2);
  }
  const endTime3 = performance.now();
  const executionTime3 = endTime3 - startTime3;
  console.log(`cb2 JSON conversion execution time: ${executionTime3} milliseconds`);

  // Make a "clean" object without any connect tainting in its definitions
  let cbpj = JSON.stringify(compact_block.toJson());
  let cb3 = JSON.parse(cbpj);
  console.log("cb3 is: ", cb3)

  const startTime4 = performance.now();
  for (let i = 0; i < 10000; i++) {
    JSON.stringify(cb3);
  }
  const endTime4 = performance.now();
  const executionTime4 = endTime4 - startTime4;
  console.log(`cb3 JSON conversion execution time: ${executionTime4} milliseconds`);

  const sct = await indexedDb.getStateCommitmentTree();
  const witnessData = getWitness(transactionPlan, sct);

  yield* optimisticBuild(
    transactionPlan,
    witnessData,
    custodyAuthorize(ctx, transactionPlan),
    fullViewingKey,
  );
};
