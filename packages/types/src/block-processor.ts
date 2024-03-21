import { CompactBlock } from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/compact_block/v1/compact_block_pb";

export interface BlockProcessorInterface {
  retrieveCompactBlock(startHeight: bigint): Promise<CompactBlock | null>;
  sync(): Promise<void>;
  stop(r?: string): void;
}
