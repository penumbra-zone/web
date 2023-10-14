import { z } from 'zod';
import { InnerBase64Schema } from './base64';
import {
  SpendableNoteRecord,
  SwapRecord,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';

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
  set_forgotten: z.number().optional(),
  store_commitments: z.array(StoreCommitmentSchema),
  store_hashes: z.array(StoreHashSchema),
  delete_ranges: z.array(DeleteRange),
});

export const ScanResultSchema = z.object({
  height: z.bigint(),
  nct_updates: SctUpdatesSchema,
  new_notes: z.array(z.unknown()),
  new_swaps: z.array(z.unknown()),
});

export type RawScanResult = z.infer<typeof ScanResultSchema>;

export interface ScanResult {
  height: bigint;
  sctUpdates: z.infer<typeof SctUpdatesSchema>;
  newNotes: SpendableNoteRecord[];
  newSwaps: SwapRecord[];
}

export const parseScanResult = (r: RawScanResult): ScanResult => {
  return {
    height: BigInt(r.height), // TODO: Should see if wasm crate can pass bigint instead
    sctUpdates: r.nct_updates,
    newNotes: r.new_notes.map(n => SpendableNoteRecord.fromJsonString(JSON.stringify(n))),
    newSwaps: r.new_swaps.map(s => SwapRecord.fromJsonString(JSON.stringify(s))),
  };
};

export const StateCommitmentTreeSchema = z.object({
  last_position: StoredPositionSchema,
  last_forgotten: z.number(),
  hashes: z.array(StoreHashSchema),
  commitments: z.array(StoreCommitmentSchema),
});

export type StateCommitmentTree = z.infer<typeof StateCommitmentTreeSchema>;
