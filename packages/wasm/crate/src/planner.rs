use std::collections::BTreeMap;

use anyhow::anyhow;
use ark_ff::UniformRand;
use decaf377::{Fq, Fr};
use penumbra_asset::{asset, Balance, Value};
use penumbra_dex::swap_claim::SwapClaimPlan;
use penumbra_dex::{
    swap::{SwapPlaintext, SwapPlan},
    TradingPair,
};
use penumbra_fee::{Fee, FeeTier, Gas, GasPrices};
use penumbra_keys::keys::AddressIndex;
use penumbra_keys::{Address, FullViewingKey};
use penumbra_num::Amount;
use penumbra_proto::core::app::v1::AppParameters;
use penumbra_proto::core::component::ibc;
use penumbra_proto::DomainType;
use penumbra_proto::view::v1::{
    transaction_planner_request as tpr, NotesRequest, TransactionPlannerRequest,
};
use penumbra_sct::params::SctParameters;
use penumbra_shielded_pool::{fmd, OutputPlan, SpendPlan};
use penumbra_stake::rate::RateData;
use penumbra_stake::{IdentityKey, Penalty, UndelegateClaimPlan};
use penumbra_transaction::gas::GasCost;
use penumbra_transaction::memo::MemoPlaintext;
use penumbra_transaction::{plan::MemoPlan, ActionPlan, TransactionParameters, TransactionPlan};
use rand_core::OsRng;
use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::JsValue;

use crate::note_record::SpendableNoteRecord;
use crate::storage::IndexedDBStorage;
use crate::utils;
use crate::{error::WasmResult, swap_record::SwapRecord};

struct ActionList {
    // A list of the user-specified outputs.
    actions: Vec<ActionPlan>,
    // These are tracked separately for convenience when adjusting change.
    change_outputs: BTreeMap<asset::Id, OutputPlan>,
}

impl ActionList {
    fn new() -> Self {
        Self {
            actions: Vec::new(),
            change_outputs: BTreeMap::new(),
        }
    }

    fn balance(&self) -> Balance {
        let mut balance = Balance::zero();
        for action in &self.actions {
            balance += action.balance();
        }
        for action in self.change_outputs.values() {
            balance += action.balance();
        }
        balance
    }

    fn push(&mut self, action: ActionPlan) {
        self.actions.push(action);
    }

    fn gas_estimate(&self) -> Gas {
        // TODO: this won't include the gas cost for the bytes of the tx itself
        // so this gas estimate will be an underestimate, but since the tx-bytes contribution
        // to the fee is ideally small, hopefully it doesn't matter.
        let mut gas = Gas::zero();
        for action in &self.actions {
            // TODO missing AddAssign
            gas = gas + action.gas_cost();
        }
        for action in self.change_outputs.values() {
            // TODO missing AddAssign
            // TODO missing GasCost impl on OutputPlan
            gas = gas + ActionPlan::from(action.clone()).gas_cost();
        }

        gas
    }

    fn fee_estimate(&self, gas_prices: &GasPrices, fee_tier: &FeeTier) -> Fee {
        let base_fee = Fee::from_staking_token_amount(gas_prices.fee(&self.gas_estimate()));
        base_fee.apply_tier(*fee_tier)
    }

    fn balance_with_fee_estimate(&self, gas_prices: &GasPrices, fee_tier: &FeeTier) -> Balance {
        self.balance() - self.fee_estimate(gas_prices, fee_tier).0
    }

    fn refresh_change(&mut self, change_address: Address) {
        self.change_outputs = BTreeMap::new();
        // For each "provided" balance component, create a change note.
        for value in self.balance().provided() {
            self.change_outputs.insert(
                value.asset_id,
                OutputPlan::new(&mut OsRng, value, change_address),
            );
        }
    }

    fn adjust_change_for_fee(&mut self, fee: Fee) {
        self.change_outputs.entry(fee.0.asset_id).and_modify(|e| {
            e.value.amount = e.value.amount.saturating_sub(&fee.0.amount);
        });
    }
}

/// Prioritize notes to spend to release value of a specific transaction.
///
/// Various logic is possible for note selection. Currently, this method
/// prioritizes notes sent to a one-time address, then notes with the largest
/// value:
///
/// - Prioritizing notes sent to one-time addresses optimizes for a future in
/// which we implement DAGSync keyed by fuzzy message detection (which will not
/// be able to detect notes sent to one-time addresses). Spending these notes
/// immediately converts them into change notes, sent to the default address for
/// the users' account, which are detectable.
///
/// - Prioritizing notes with the largest value optimizes for gas used by the
/// transaction.
///
/// We may want to make note prioritization configurable in the future. For
/// instance, a user might prefer a note prioritization strategy that harvested
/// capital losses when possible, using cost basis information retained by the
/// view server.
fn prioritize_and_filter_spendable_notes(
    records: Vec<SpendableNoteRecord>,
) -> Vec<SpendableNoteRecord> {
    let mut filtered = records
        .into_iter()
        .filter(|record| record.note.amount() > Amount::zero())
        .collect::<Vec<_>>();

    filtered.sort_by(|a, b| {
        // Sort by whether the note was sent to an ephemeral address...
        match (
            a.address_index.is_ephemeral(),
            b.address_index.is_ephemeral(),
        ) {
            (true, false) => std::cmp::Ordering::Less,
            (false, true) => std::cmp::Ordering::Greater,
            // ... then by largest amount.
            _ => b.note.amount().cmp(&a.note.amount()),
        }
    });

    filtered
}

/// Process a `TransactionPlannerRequest`, returning a `TransactionPlan`
#[wasm_bindgen]
pub async fn plan_transaction(
    idb_constants: JsValue,
    request: JsValue,
    full_viewing_key: &[u8],
) -> WasmResult<JsValue> {
    utils::set_panic_hook();

    let request: TransactionPlannerRequest = serde_wasm_bindgen::from_value(request)?;

    let source_address_index: AddressIndex = request
        .source
        .map(TryInto::try_into)
        .transpose()?
        .unwrap_or_default();

    let fvk: FullViewingKey = FullViewingKey::decode(full_viewing_key)?;


    // should ignore the randomizer for change_address, there is no point using ephemeral address
    let (change_address, _) = fvk
        .incoming()
        .payment_address(source_address_index.account.into());

    let storage = IndexedDBStorage::new(serde_wasm_bindgen::from_value(idb_constants)?).await?;

    let fmd_params: fmd::Parameters = storage
        .get_fmd_params()
        .await?
        .ok_or_else(|| anyhow!("FmdParameters not available"))?;

    let app_parameters: AppParameters = storage
        .get_app_params()
        .await?
        .ok_or_else(|| anyhow!("AppParameters not available"))?;
    let sct_params: SctParameters = app_parameters
        .sct_params
        .ok_or_else(|| anyhow!("SctParameters not available"))?
        .try_into()?;
    let chain_id: String = app_parameters.chain_id;

    let gas_prices: GasPrices = {
        let gas_prices: penumbra_proto::core::component::fee::v1::GasPrices =
            serde_wasm_bindgen::from_value(
                storage
                    .get_gas_prices()
                    .await?
                    .ok_or_else(|| anyhow!("GasPrices not available"))?,
            )?;
        gas_prices.try_into()?
    };

    // Phase 1: process all of the user-supplied intents into complete action plans.

    let mut actions = ActionList::new();

    for tpr::Output { value, address } in request.outputs {
        let value = value
            .ok_or_else(|| anyhow!("missing value in output"))?
            .try_into()?;
        let address = address
            .ok_or_else(|| anyhow!("missing address in output"))?
            .try_into()?;

        let output = OutputPlan::new(&mut OsRng, value, address).into();

        actions.push(output);
    }

    for tpr::Swap {
        value,
        target_asset,
        fee,
        claim_address,
    } in request.swaps
    {
        let value: Value = value
            .ok_or_else(|| anyhow!("missing value in swap"))?
            .try_into()?;
        let target_asset = target_asset
            .ok_or_else(|| anyhow!("missing target asset in swap"))?
            .try_into()?;
        let fee = fee
            .ok_or_else(|| anyhow!("missing fee in swap"))?
            .try_into()?;
        let claim_address = claim_address
            .ok_or_else(|| anyhow!("missing claim address in swap"))?
            .try_into()?;

        // Determine the canonical order for the assets being swapped.
        // This will determine whether the input amount is assigned to delta_1 or delta_2.
        let trading_pair = TradingPair::new(value.asset_id, target_asset);

        // If `trading_pair.asset_1` is the input asset, then `delta_1` is the input amount,
        // and `delta_2` is 0.
        //
        // Otherwise, `delta_1` is 0, and `delta_2` is the input amount.
        let (delta_1, delta_2) = if trading_pair.asset_1() == value.asset_id {
            (value.amount, 0u64.into())
        } else {
            (0u64.into(), value.amount)
        };

        // If there is no input, then there is no swap.
        if delta_1 == Amount::zero() && delta_2 == Amount::zero() {
            return Err(anyhow!("No input value for swap").into());
        }

        // Create the `SwapPlaintext` representing the swap to be performed:
        let swap_plaintext = SwapPlaintext::new(
            &mut OsRng,
            trading_pair,
            delta_1,
            delta_2,
            fee,
            claim_address,
        );

        let swap = SwapPlan::new(&mut OsRng, swap_plaintext).into();

        actions.push(swap);
    }

    for tpr::SwapClaim { swap_commitment } in request.swap_claims {
        let swap_commitment =
            swap_commitment.ok_or_else(|| anyhow!("missing swap commitment in swap claim"))?;

        let swap_record: SwapRecord = storage
            .get_swap_by_commitment(swap_commitment)
            .await?
            .ok_or_else(|| anyhow!("Swap record not found"))?
            .try_into()?;

        let swap_claim = SwapClaimPlan {
            swap_plaintext: swap_record.swap,
            position: swap_record.position,
            output_data: swap_record.output_data,
            epoch_duration: sct_params.epoch_duration,
            proof_blinding_r: Fq::rand(&mut OsRng),
            proof_blinding_s: Fq::rand(&mut OsRng),
        }
        .into();

        actions.push(swap_claim);
    }

    for tpr::Delegate { amount, rate_data } in request.delegations {
        let epoch = storage.get_latest_known_epoch().await?.unwrap();
        let amount = amount
            .ok_or_else(|| anyhow!("missing amount in delegation"))?
            .try_into()?;
        let rate_data: RateData = rate_data
            .ok_or_else(|| anyhow!("missing rate data in delegation"))?
            .try_into()?;
        actions.push(rate_data.build_delegate(epoch.into(), amount).into());
    }

    for tpr::Undelegate { value, rate_data } in request.undelegations {
        let epoch = storage.get_latest_known_epoch().await?.unwrap();
        let value: Value = value
            .ok_or_else(|| anyhow!("missing value in undelegation"))?
            .try_into()?;
        let rate_data: RateData = rate_data
            .ok_or_else(|| anyhow!("missing rate data in undelegation"))?
            .try_into()?;
        actions.push(
            rate_data
                .build_undelegate(epoch.into(), value.amount)
                .into(),
        );
    }

    for tpr::UndelegateClaim {
        validator_identity,
        unbonding_start_height,
        penalty,
        unbonding_amount,
        ..
    } in request.undelegation_claims
    {
        let validator_identity: IdentityKey = validator_identity
            .ok_or_else(|| anyhow!("missing validator identity in undelegation claim"))?
            .try_into()?;
        let penalty: Penalty = penalty
            .ok_or_else(|| anyhow!("missing penalty in undelegation claim"))?
            .try_into()?;
        let unbonding_amount: Amount = unbonding_amount
            .ok_or_else(|| anyhow!("missing unbonding amount in undelegation claim"))?
            .try_into()?;

        let undelegate_claim_plan = UndelegateClaimPlan {
            validator_identity,
            unbonding_start_height,
            penalty,
            unbonding_amount,
            balance_blinding: Fr::rand(&mut OsRng),
            proof_blinding_r: Fq::rand(&mut OsRng),
            proof_blinding_s: Fq::rand(&mut OsRng),
        };

        actions.push(ActionPlan::UndelegateClaim(undelegate_claim_plan));
    }

    #[allow(clippy::never_loop)]
    for ibc::v1::IbcRelay { .. } in request.ibc_relay_actions {
        return Err(anyhow!("IbcRelay not yet implemented").into());
    }

    for ics20_withdrawal in request.ics20_withdrawals {
        actions.push(ActionPlan::Ics20Withdrawal(ics20_withdrawal.try_into()?));
    }

    #[allow(clippy::never_loop)]
    for tpr::PositionOpen { .. } in request.position_opens {
        return Err(anyhow!("PositionOpen not yet implemented").into());
    }

    #[allow(clippy::never_loop)]
    for tpr::PositionClose { .. } in request.position_closes {
        return Err(anyhow!("PositionClose not yet implemented").into());
    }

    #[allow(clippy::never_loop)]
    for tpr::PositionWithdraw { .. } in request.position_withdraws {
        return Err(anyhow!("PositionWithdraw not yet implemented").into());
    }

    // Phase 2: fill in the required spends to make the transaction balance.

    let fee_tier = match request.fee_mode {
        None => FeeTier::default(),
        Some(tpr::FeeMode::AutoFee(tier)) => tier.try_into()?,
        Some(tpr::FeeMode::ManualFee(_)) => {
            return Err(anyhow!("Manual fee mode not yet implemented").into());
        }
    };

    // It's possible that adding spends could increase the gas, increasing the fee
    // amount, and so on, so we add spends iteratively.

    let mut notes_by_asset_id = BTreeMap::new();
    for required in actions
        .balance_with_fee_estimate(&gas_prices, &fee_tier)
        .required()
    {
        // Find all the notes of this asset in the source account.
        let records = storage
            .get_notes(NotesRequest {
                include_spent: false,
                asset_id: Some(required.asset_id.into()),
                address_index: Some(source_address_index.into()),
                amount_to_spend: None,
            })
            .await?;
        notes_by_asset_id.insert(
            required.asset_id,
            prioritize_and_filter_spendable_notes(records),
        );
    }

    let mut iterations = 0usize;

    while let Some(required) = actions
        .balance_with_fee_estimate(&gas_prices, &fee_tier)
        .required()
        .next()
    {
        // Spend a single note towards the required balance, if possible.
        let Some(note) = notes_by_asset_id
            .get_mut(&required.asset_id)
            .expect("we already queried")
            .pop()
        else {
            return Err(anyhow!(
                "ran out of notes to spend while planning transaction, need {} of asset {}",
                required.amount,
                required.asset_id,
            )
            .into());
        };
        actions.push(SpendPlan::new(&mut OsRng, note.note, note.position).into());

        // Recompute the change outputs, without accounting for fees.
        actions.refresh_change(change_address);
        // Now re-estimate the fee of the updated transaction and adjust the change if possible.
        let fee = actions.fee_estimate(&gas_prices, &fee_tier);
        actions.adjust_change_for_fee(fee);

        iterations += 1;
        if iterations > 100 {
            return Err(anyhow!("failed to plan transaction after 100 iterations").into());
        }
    }

    let fee = actions.fee_estimate(&gas_prices, &fee_tier);

    let mut plan = TransactionPlan {
        actions: actions
            .actions
            .into_iter()
            .chain(actions.change_outputs.into_values().map(Into::into))
            .collect(),
        transaction_parameters: TransactionParameters {
            expiry_height: request.expiry_height,
            chain_id,
            fee,
        },
        detection_data: None,
        memo: None,
    };

    if let Some(pb_memo_plaintext) = request.memo {
        plan.memo = Some(MemoPlan::new(&mut OsRng, pb_memo_plaintext.try_into()?)?);
    } else if plan.output_plans().next().is_some() {
        // If a memo was not provided, but is required (because we have outputs),
        // auto-create one with the change address.
        plan.memo = Some(MemoPlan::new(
            &mut OsRng,
            MemoPlaintext::new(change_address, String::new())?,
        )?);
    }

    plan.populate_detection_data(&mut OsRng, fmd_params.precision_bits.into());

    Ok(serde_wasm_bindgen::to_value(&plan)?)
}
