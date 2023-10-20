import { WasmPlanner } from '@penumbra-zone/wasm-bundler';
import { IdbConstants } from '@penumbra-zone/types';
import { Address } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';
import {
  MemoPlaintext,
  TransactionPlan,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { Value } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import { Fee } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/fee/v1alpha1/fee_pb';
import {
  ChainParameters,
  FmdParameters,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/chain/v1alpha1/chain_pb';
import { JsonValue } from '@bufbuild/protobuf';

interface PlannerProps {
  idbConstants: IdbConstants;
  chainParams: ChainParameters;
  fmdParams: FmdParameters;
}

export class TxPlanner {
  private constructor(private wasmPlanner: WasmPlanner) {}

  static async initialize({
    idbConstants,
    chainParams,
    fmdParams,
  }: PlannerProps): Promise<TxPlanner> {
    const wp = await WasmPlanner.new(idbConstants, chainParams, fmdParams);
    return new this(wp);
  }

  output(value: Value, addr: Address): void {
    this.wasmPlanner.output(value.toJson(), addr.toJson());
  }

  expiryHeight(value: bigint): void {
    this.wasmPlanner.expiry_height(value);
  }

  memo(memo: MemoPlaintext): void {
    this.wasmPlanner.memo(memo.toJson());
  }

  fee(fee: Fee): void {
    this.wasmPlanner.fee(fee.toJson());
  }

  async plan(refundAddr: Address): Promise<TransactionPlan> {
    const json = (await this.wasmPlanner.plan(refundAddr.toJson())) as JsonValue;
    return TransactionPlan.fromJson(json);
  }
}
