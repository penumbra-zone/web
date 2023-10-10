// import { z } from 'zod';
// import { txBytesSchema } from './transaction';
//
// const blockIdSchema = z.object({
//   hash: z.instanceof(Uint8Array),
//   partSetHeader: z.object({
//     total: z.number(),
//     hash: z.instanceof(Uint8Array),
//   }),
// });
//
// const timeSchema = z.object({
//   seconds: z.bigint(),
//   nanos: z.number(),
// });
//
// const signatureSchema = z.object({
//   blockIdFlag: z.number(),
//   validatorAddress: z.instanceof(Uint8Array),
//   timestamp: timeSchema.optional(),
//   signature: z.instanceof(Uint8Array),
// });
//
// export type Block = z.infer<typeof blockSchema>;
//
// export const blockSchema = z.object({
//   blockId: blockIdSchema,
//   block: z.object({
//     header: z.object({
//       version: z.object({
//         block: z.bigint(),
//         app: z.bigint(),
//       }),
//       chainId: z.string(),
//       height: z.bigint(),
//       time: timeSchema,
//       lastBlockId: blockIdSchema,
//       lastCommitHash: z.instanceof(Uint8Array),
//       dataHash: z.instanceof(Uint8Array),
//       validatorsHash: z.instanceof(Uint8Array),
//       nextValidatorsHash: z.instanceof(Uint8Array),
//       consensusHash: z.instanceof(Uint8Array),
//       appHash: z.instanceof(Uint8Array),
//       lastResultsHash: z.instanceof(Uint8Array),
//       evidenceHash: z.instanceof(Uint8Array),
//       proposerAddress: z.instanceof(Uint8Array),
//     }),
//     data: z.object({
//       txs: z.array(txBytesSchema),
//     }),
//     evidence: z.object({
//       evidence: z.array(z.any()),
//     }),
//     lastCommit: z.object({
//       height: z.bigint(),
//       round: z.number(),
//       blockId: blockIdSchema,
//       signatures: z.array(signatureSchema),
//     }),
//   }),
// });
