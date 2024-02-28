import { WasmPlanner } from '../wasm';
import { IdbConstants } from '@penumbra-zone/types';
import {
  Address,
  AddressIndex,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import {
  MemoPlaintext,
  TransactionPlan,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import {
  Metadata,
  Value,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { SctParameters } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/sct/v1/sct_pb';
import { FmdParameters } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1/shielded_pool_pb';
import {
  Fee,
  FeeTier,
  GasPrices,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/fee/v1/fee_pb';
import { JsonValue } from '@bufbuild/protobuf';
import { Ics20Withdrawal } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/ibc/v1/ibc_pb';
import { StateCommitment } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/crypto/tct/v1/tct_pb';
import { TransactionPlannerRequest_Delegate } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';

export class TxPlanner {
  private constructor(private wasmPlanner: WasmPlanner) {}

  static async initialize(
    idbConstants: IdbConstants,
    chainId: string,
    sctParams: SctParameters,
    fmdParams: FmdParameters,
  ): Promise<TxPlanner> {
    const wp = await WasmPlanner.new(idbConstants, chainId, sctParams, fmdParams);
    return new this(wp);
  }

  output(value: Value, addr: Address): void {
    this.wasmPlanner.output(value.toJson(), addr.toJson());
  }

  swap(inputValue: Value, intoDenom: Metadata, fee: Fee, claimAddress: Address): void {
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

  delegate(delegation: TransactionPlannerRequest_Delegate): void {
    this.wasmPlanner.delegate(delegation.amount?.toJson(), delegation.rateData?.toJson());
  }

  expiryHeight(value: bigint): void {
    this.wasmPlanner.expiry_height(value);
  }

  memo(memo: MemoPlaintext): void {
    this.wasmPlanner.memo(memo.toJson());
  }

  setGasPrices(gasPrices: GasPrices): void {
    this.wasmPlanner.set_gas_prices(gasPrices.toJson());
  }

  fee(fee: Fee): void {
    this.wasmPlanner.fee(fee.toJson());
  }

  setFeeTier(feeTier: FeeTier): void {
    this.wasmPlanner.set_fee_tier(feeTier);
  }

  async plan(refundAddr: Address, source: AddressIndex): Promise<TransactionPlan> {
    const json = (await this.wasmPlanner.plan(refundAddr.toJson(), source.toJson())) as JsonValue;
    return TransactionPlan.fromJson(json);
  }
}
