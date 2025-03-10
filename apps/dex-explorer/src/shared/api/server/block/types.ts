import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

export interface BatchSwapSummary {
  startAsset: Metadata;
  endAsset: Metadata;
  startInput: string;
  endOutput: string;
  endPrice: string;
  numSwaps: number;
}

export type BlockSummaryApiResponse =
  | {
      height: number;
      time: Date;
      batchSwaps: BatchSwapSummary[];
      numOpenLps: number;
      numClosedLps: number;
      numWithdrawnLps: number;
      numSwaps: number;
      numSwapClaims: number;
      numTxs: number;
    }
  | { error: string };
