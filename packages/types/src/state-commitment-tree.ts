import { z } from 'zod';
import { InnerBase64Schema } from './base64';
import {
  SpendableNoteRecord,
  SwapRecord,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';

export const Position = z.object({
  epoch: z.number(),
  block: z.number(),
  commitment: z.number(),
});

export const StoredPositionSchema = z.union([
  z.object({
    Position: Position,
  }),
  z.literal('Full'),
]);

export type StoredPosition = z.infer<typeof StoredPositionSchema>;

export const StoreHashSchema = z.object({
  position: Position,
  height: z.number(),
  hash: z.instanceof(Uint8Array),
  essential: z.boolean(),
});

export type StoreHash = z.infer<typeof StoreHashSchema>;

export const StoreCommitmentSchema = z.object({
  position: Position,
  commitment: InnerBase64Schema,
});

export type StoreCommitment = z.infer<typeof StoreCommitmentSchema>;

export const DeleteRange = z.object({
  below_height: z.number(), // exclusive
  positions: z.object({
    start: Position, // inclusive
    end: Position, // exclusive
  }),
});

export const SctUpdatesSchema = z.object({
  set_position: StoredPositionSchema.optional(),
  set_forgotten: z.bigint().optional(),
  store_commitments: z.array(StoreCommitmentSchema),
  store_hashes: z.array(StoreHashSchema),
  delete_ranges: z.array(DeleteRange),
});

export type SctUpdates = z.infer<typeof SctUpdatesSchema>;

export interface ScanBlockResult {
  height: bigint;
  sctUpdates: SctUpdates;
  newNotes: SpendableNoteRecord[];
  newSwaps: SwapRecord[];
}

export const StateCommitmentTreeSchema = z.object({
  last_position: StoredPositionSchema,
  last_forgotten: z.bigint(),
  hashes: z.array(StoreHashSchema),
  commitments: z.array(StoreCommitmentSchema),
});

export type StateCommitmentTree = z.infer<typeof StateCommitmentTreeSchema>;
