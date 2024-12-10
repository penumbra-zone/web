import { Metadata, ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

export interface PositionStateVV {
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

export interface VolumeAndFeesAll {
  asset1: Metadata;
  asset2: Metadata;
  totals: Omit<VolumeAndFeesVV, 'contextAssetStart' | 'contextAssetEnd'>;
  all: VolumeAndFeesVV[];
}

export interface PositionWithdrawalVV {
  reserves1: ValueView;
  reserves2: ValueView;
  time: string;
  height: number;
  txHash: string;
}

export interface PositionExecutionVV {
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

export interface PositionExecutionsVV {
  items: PositionExecutionVV[];
  skipped: number;
}

export interface PositionTimelineResponseVV {
  executions: PositionExecutionsVV;
  state: PositionStateVV;
  withdrawals: PositionWithdrawalVV[];
  volumeAndFees: VolumeAndFeesAll;
}
