import { WasmPlanner } from '@penumbra-zone/wasm-bundler';
import { IdbConstants } from '@penumbra-zone/types';
import {
  Address,
  AddressIndex,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';
import {
  MemoPlaintext,
  TransactionPlan,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import {
  DenomMetadata,
  Value,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import { Fee } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/fee/v1alpha1/fee_pb';
import { ChainParameters } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/chain/v1alpha1/chain_pb';
import { FmdParameters } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1alpha1/shielded_pool_pb';
import { JsonValue } from '@bufbuild/protobuf';
import { Ics20Withdrawal } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/ibc/v1alpha1/ibc_pb';
import { StateCommitment } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/crypto/tct/v1alpha1/tct_pb';

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

  swap(inputValue: Value, intoDenom: DenomMetadata, fee: Fee, claimAddress: Address): void {
    this.wasmPlanner.swap(
      inputValue.toJson(),
      intoDenom.toJson(),
      fee.toJson(),
      claimAddress.toJson(),
    );
  }

  async swapClaim(swapCommitment: StateCommitment): Promise<void> {
    await this.wasmPlanner.swap_claim(swapCommitment.toJson());
  }

  ics20Withdrawal(withdrawal: Ics20Withdrawal): void {
    this.wasmPlanner.ics20_withdrawal(withdrawal.toJson());
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

  async plan(refundAddr: Address, source: AddressIndex): Promise<TransactionPlan> {
    const json = (await this.wasmPlanner.plan(refundAddr.toJson(), source.toJson())) as JsonValue;
    return TransactionPlan.fromJson(json);
  }
}
