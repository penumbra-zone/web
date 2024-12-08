import { Serialized } from '@/shared/utils/serializer.ts';
import { Metadata, ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

export interface PositionStateResponse {
  reserves1: ValueView;
  reserves2: ValueView;
  unit1: ValueView;
  unit2: ValueView;
  offer1: ValueView;
  offer2: ValueView;
  priceRef1: ValueView;
  priceRef2: ValueView;
  priceRef1Inv: ValueView;
  priceRef2Inv: ValueView;
  feeBps: number;
  openingHeight: number;
  openingTime: string;
  openingTx?: string;
  closingHeight?: number;
  closingTime?: string;
  closingTx?: string;
}

export interface VolumeAndFeesVV {
  volume1: ValueView;
  volume2: ValueView;
  fees1: ValueView;
  fees2: ValueView;
  contextAssetStart: Metadata;
  contextAssetEnd: Metadata;
  executionCount: number;
}

export interface VolumeAndFeesResponse {
  asset1: Metadata;
  asset2: Metadata;
  totals: Omit<VolumeAndFeesVV, 'contextAssetStart' | 'contextAssetEnd'>;
  all: VolumeAndFeesVV[];
}

export interface PositionWithdrawal {
  reserves1: ValueView;
  reserves2: ValueView;
  time: string;
  height: number;
  txHash: string;
}

export interface PositionExecution {
  input: ValueView;
  output: ValueView;
  fee: ValueView;
  reserves1: ValueView;
  reserves2: ValueView;
  contextStart: Metadata;
  contextEnd: Metadata;
  time: string;
  height: number;
}

export interface PositionExecutions {
  items: PositionExecution[];
  skipped: number;
}

export interface PositionTimelineResponse {
  executions: PositionExecutions;
  state: PositionStateResponse;
  withdrawals: PositionWithdrawal[];
  volumeAndFees: VolumeAndFeesResponse;
}

export type TimelineApiResponse = Serialized<PositionTimelineResponse> | { error: string };
