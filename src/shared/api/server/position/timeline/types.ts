import { Serialized } from '@/shared/utils/serializer.ts';
import { AssetId, Value } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

export interface PositionStateResponse {
  reserves1: Value;
  reserves2: Value;
  unit1: Value;
  unit2: Value;
  offer1: Value;
  offer2: Value;
  priceRef1: Value;
  priceRef2: Value;
  priceRef1Inv: Value;
  priceRef2Inv: Value;
  feeBps: number;
  openingHeight: number;
  openingTime: string;
  openingTx?: string;
  closingHeight?: number;
  closingTime?: string;
  closingTx?: string;
}

export interface VolumeAndFeesValue {
  volume1: Value;
  volume2: Value;
  fees1: Value;
  fees2: Value;
  contextAssetStart: AssetId;
  contextAssetEnd: AssetId;
  executionCount: number;
}

export interface VolumeAndFeesResponse {
  asset1: AssetId;
  asset2: AssetId;
  totals: Omit<VolumeAndFeesValue, 'contextAssetStart' | 'contextAssetEnd'>;
  all: VolumeAndFeesValue[];
}

export interface PositionWithdrawal {
  reserves1: Value;
  reserves2: Value;
  time: string;
  height: number;
  txHash: string;
}

export interface PositionExecution {
  input: Value;
  output: Value;
  fee: Value;
  reserves1: Value;
  reserves2: Value;
  contextStart: AssetId;
  contextEnd: AssetId;
  time: string;
  height: number;
}

export interface PositionExecutions {
  items: PositionExecution[];
  skipped: number;
}

export interface PositionTimelineResponse {
  state: PositionStateResponse;
  executions: PositionExecutions;
  withdrawals: PositionWithdrawal[];
  volumeAndFees: VolumeAndFeesResponse;
}

export type TimelineApiResponse = Serialized<PositionTimelineResponse> | { error: string };
