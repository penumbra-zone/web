use std::collections::BTreeMap;
use std::mem;

use anyhow::anyhow;
use anyhow::Result;
use ark_ff::UniformRand;
use decaf377::{Fq, Fr};
use penumbra_asset::asset::{Id, Metadata};
use penumbra_asset::{asset, Balance, Value};
use penumbra_auction::auction::dutch::{
    ActionDutchAuctionEnd, ActionDutchAuctionSchedule, DutchAuctionDescription,
};
use penumbra_auction::auction::{AuctionId, AuctionNft};
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
use penumbra_proto::view::v1::{
    transaction_planner_request as tpr, NotesRequest, TransactionPlannerRequest,
};
use penumbra_proto::DomainType;
use penumbra_sct::params::SctParameters;
use penumbra_shielded_pool::{fmd, OutputPlan, SpendPlan};
use penumbra_stake::rate::RateData;
use penumbra_stake::{Delegate, IdentityKey, Penalty, Undelegate, UndelegateClaimPlan};
use penumbra_transaction::gas::GasCost;
use penumbra_transaction::memo::MemoPlaintext;
use penumbra_transaction::{plan::MemoPlan, ActionPlan, TransactionParameters, TransactionPlan};
use prost::Message;
use rand_core::{CryptoRng, OsRng, RngCore};
use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::JsValue;

use crate::metadata::customize_symbol_inner;
use crate::note_record::SpendableNoteRecord;
use crate::storage::IndexedDBStorage;
use crate::utils;
use crate::{error::WasmResult, swap_record::SwapRecord};

/// A list of planned actions to be turned into a TransactionPlan.
///
/// A transaction is a bundle of actions plus auxiliary data (like a memo). A
/// transaction plan is a bundle of action plans plus plans for the auxiliary
/// data (like a memo plan).  The [`ActionList`] is just the list of actions,
/// which is useful for building up a [`TransactionPlan`].
#[derive(Debug, Default, Clone)]
pub struct ActionList {
    // A list of the user-specified outputs.
    actions: Vec<ActionPlan>,
    // These are tracked separately for convenience when adjusting change.
    change_outputs: BTreeMap<asset::Id, OutputPlan>,
    // The fee is tracked as part of the ActionList so it can be adjusted
    // internally to handle special cases like swap claims.
    fee: Fee,
}

impl ActionList {
    /// Returns true if the resulting transaction would require a memo.
    pub fn requires_memo(&self) -> bool {
        let has_change_outputs = !self.change_outputs.is_empty();
        let has_other_outputs = self
            .actions
            .iter()
            .any(|action| matches!(action, ActionPlan::Output(_)));

        has_change_outputs || has_other_outputs
    }

    /// Convert this list of actions into a [`TransactionPlan`].
    pub fn into_plan<R: RngCore + CryptoRng>(
        self,
        rng: R,
        fmd_params: &fmd::Parameters,
        mut transaction_parameters: TransactionParameters,
        memo_plan: Option<MemoPlan>,
    ) -> Result<TransactionPlan> {
        transaction_parameters.fee = self.fee;

        let mut plan = TransactionPlan {
            actions: self
                .actions
                .into_iter()
                .chain(self.change_outputs.into_values().map(Into::into))
                .collect(),
            transaction_parameters,
            memo: memo_plan,
            detection_data: None,
        };
        plan.populate_detection_data(rng, fmd_params.precision_bits.into());

        // Implement a canonical ordering to the actions within the transaction
        // plan to reduce client distinguishability.
        plan.sort_actions();

        Ok(plan)
    }

    /// Push a new action onto this list.
    pub fn push<A: Into<ActionPlan>>(&mut self, action: A) {
        let plan = action.into();

        // Special case: if the plan is a `SwapClaimPlan`, adjust the fee to include the
        // prepaid fee contributed by the swap claim. This helps ensure that the value
        // released by the swap claim is used to pay the fee, rather than generating change.
        if let ActionPlan::SwapClaim(claim) = &plan {
            let claim_fee = claim.swap_plaintext.claim_fee;
            if self.fee.amount() == Amount::zero() {
                // If the fee is currently zero, set it to the claim fee,
                // regardless of fee token, i.e., set the fee token to match
                // the swap claim.
                self.fee = claim_fee;
            } else if self.fee.asset_matches(&claim_fee) {
                // Otherwise, if the fee token matches, accumulate the amount
                // released by the swap claim into the fee, rather than letting it
                // be handled as change.
                self.fee.0.amount += claim_fee.amount();
            } else {
                // In this situation, the fee has been manually set to a
                // different token than was released by the swap claim. So we
                // can't accumulate the swap claim fee into it, and it will
                // produce change instead.
            }
        }

        self.actions.push(plan);
    }

    /// Compute the gas used by a transaction comprised of the actions in this list.
    ///
    /// Because Penumbra transactions have static gas costs, and gas use is linear in the actions,
    /// this is an exact computation.
    fn gas_cost(&self) -> Gas {
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

    /// Use the provided gas prices and fee tier to estimate the fee for
    /// the transaction.
    ///
    /// While the gas cost can be computed exactly, the base fee can only be
    /// estimated, because the actual base fee paid by the transaction will
    /// depend on the gas prices at the time it's accepted on-chain.
    fn compute_fee_estimate(&self, gas_prices: &GasPrices, fee_tier: &FeeTier) -> Fee {
        let base_fee = gas_prices.fee(&self.gas_cost());
        base_fee.apply_tier(*fee_tier)
    }

    /// Use the provided gas prices and fee tier to refresh the fee estimate for
    /// the transaction.
    ///
    /// If the current fee estimate is too low, it will be increased. In that
    /// case, change notes will be adjusted to cover the increase if possible.
    pub fn refresh_fee_and_change<R: RngCore + CryptoRng>(
        &mut self,
        rng: R,
        gas_prices: &GasPrices,
        fee_tier: &FeeTier,
        change_address: &Address,
    ) {
        // First, refresh the change outputs, to capture any surplus imbalance.
        self.refresh_change(rng, &change_address);

        // Next, recompute the fee estimate for the actions and change outputs.
        let new_fee = self.compute_fee_estimate(gas_prices, fee_tier);

        // Update the targeted fee with the new estimate.
        if new_fee.asset_matches(&self.fee) {
            // Take the max of the current fee and the new estimate. This ensures
            // that if we already overpaid the fee for some reason, we don't lower it
            // and cause the creation of unwanted change outputs.
            self.fee.0.amount = std::cmp::max(self.fee.amount(), new_fee.amount());
        } else {
            // Otherwise, overwrite the previous fee with the new estimate.
            self.fee = new_fee;
        }

        // Finally, adjust the change outputs to cover the fee increase if possible.
        self.adjust_change_for_imbalance();
    }

    /// Return the balance of the actions in the list, without accounting for fees.
    pub fn balance_without_fee(&self) -> Balance {
        let mut balance = Balance::zero();

        for action in &self.actions {
            balance += action.balance();
        }
        for action in self.change_outputs.values() {
            balance += action.balance();
        }

        balance
    }

    /// Return the balance of the actions in the list, minus the currently estimated fee
    /// required to pay their gas costs.
    pub fn balance_with_fee(&self) -> Balance {
        self.balance_without_fee() - self.fee.0
    }

    /// Refresh the change notes used to store any surplus imbalance from the
    /// actions in the list.
    fn refresh_change<R: RngCore + CryptoRng>(&mut self, mut rng: R, change_address: &Address) {
        self.change_outputs = BTreeMap::new();
        // For each "provided" balance component, create a change note.
        for value in self.balance_with_fee().provided() {
            self.change_outputs.insert(
                value.asset_id,
                OutputPlan::new(&mut rng, value, change_address.clone()),
            );
        }
    }

    /// Attempt adjust existing change notes to repair imbalance:
    ///
    /// - cover required balance by decreasing change if possible
    /// - cover surplus balance by increasing change if possible
    fn adjust_change_for_imbalance(&mut self) {
        // We need to grab the current balance upfront before doing modifications.
        let balance = self.balance_with_fee();

        // Sweep surplus balance into existing change notes.
        for provided in balance.provided() {
            self.change_outputs
                .entry(provided.asset_id)
                .and_modify(|e| {
                    e.value.amount += provided.amount;
                });
        }

        // Attempt to cover imbalance via existing change notes.
        for required in balance.required() {
            self.change_outputs
                .entry(required.asset_id)
                .and_modify(|e| {
                    // It's important to use saturating_sub here because
                    // our expectation is that we commonly won't have enough balance.
                    e.value.amount = e.value.amount.saturating_sub(&required.amount);
                });
        }

        // Remove any 0-value change notes we might have created.
        self.change_outputs
            .retain(|_, output| output.value.amount > Amount::zero());
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
    request: &[u8],
    full_viewing_key: &[u8],
) -> WasmResult<JsValue> {
    utils::set_panic_hook();

    let request = TransactionPlannerRequest::decode(request)?;

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

    let mut actions = ActionList::default();

    // Phase 1: process all of the user-supplied intents into complete action plans.

    for tpr::Output { value, address } in request.outputs {
        let value = value
            .ok_or_else(|| anyhow!("missing value in output"))?
            .try_into()?;
        let address = address
            .ok_or_else(|| anyhow!("missing address in output"))?
            .try_into()?;

        let output: OutputPlan = OutputPlan::new(&mut OsRng, value, address).into();

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

        let swap: SwapPlan = SwapPlan::new(&mut OsRng, swap_plaintext).into();

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

        let swap_claim: SwapClaimPlan = SwapClaimPlan {
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

        let delegate: Delegate = rate_data.build_delegate(epoch.into(), amount).into();
        actions.push(delegate);
    }

    for tpr::Undelegate { value, rate_data } in request.undelegations {
        let epoch = storage.get_latest_known_epoch().await?.unwrap();
        let value: Value = value
            .ok_or_else(|| anyhow!("missing value in undelegation"))?
            .try_into()?;
        let rate_data: RateData = rate_data
            .ok_or_else(|| anyhow!("missing rate data in undelegation"))?
            .try_into()?;

        let undelegate: Undelegate = rate_data
            .build_undelegate(epoch.into(), value.amount)
            .into();

        save_unbonding_token_metadata_if_needed(&undelegate, &storage).await?;

        actions.push(undelegate);
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

    for tpr::ActionDutchAuctionSchedule { description } in request.dutch_auction_schedule_actions {
        let description = description
            .ok_or_else(|| anyhow!("missing description in Dutch auction schedule action"))?;
        let input: Value = description
            .input
            .ok_or_else(|| anyhow!("missing input in Dutch auction schedule action"))?
            .try_into()?;
        let output_id: Id = description
            .output_id
            .ok_or_else(|| anyhow!("missing output ID in Dutch auction schedule action"))?
            .try_into()?;
        let min_output: Amount = description
            .min_output
            .ok_or_else(|| anyhow!("missing min output in Dutch auction schedule action"))?
            .try_into()?;
        let max_output: Amount = description
            .max_output
            .ok_or_else(|| anyhow!("missing max output in Dutch auction schedule action"))?
            .try_into()?;
        let mut nonce = [0u8; 32];
        OsRng.fill_bytes(&mut nonce);

        let description = DutchAuctionDescription {
            start_height: description.start_height,
            end_height: description.end_height,
            step_count: description.step_count,
            input,
            output_id,
            min_output,
            max_output,
            nonce,
        };

        save_auction_nft_metadata_if_needed(
            description.id(),
            &storage,
            // When scheduling a Dutch auction, the sequence number is always 0
            0,
        )
        .await?;

        actions.push(ActionPlan::ActionDutchAuctionSchedule(
            ActionDutchAuctionSchedule { description },
        ));
    }

    for tpr::ActionDutchAuctionEnd { auction_id } in request.dutch_auction_end_actions {
        let auction_id: AuctionId = auction_id
            .ok_or_else(|| anyhow!("missing auction ID in Dutch auction end action"))?
            .try_into()?;

        save_auction_nft_metadata_if_needed(
            auction_id, &storage,
            // When ending a Dutch auction, the sequence number is always 1
            1,
        )
        .await?;

        actions.push(ActionPlan::ActionDutchAuctionEnd(ActionDutchAuctionEnd {
            auction_id,
        }));
    }

    // TODO (Jesse): Handle Dutch auction withdraws

    // Phase 2: balance the transaction with information from the view service.
    //
    // It's possible that adding spends could increase the gas, increasing
    // the fee amount, and so on, so we add spends iteratively. However, we
    // need to query all the notes we'll use for planning upfront, so we
    // don't accidentally try to use the same one twice.

    let fee_tier = match request.fee_mode {
        None => FeeTier::default(),
        Some(tpr::FeeMode::AutoFee(tier)) => tier.try_into()?,
        Some(tpr::FeeMode::ManualFee(_)) => {
            return Err(anyhow!("Manual fee mode not yet implemented").into());
        }
    };

    // Compute an initial fee estimate based on the actions we have so far.
    actions.refresh_fee_and_change(&mut OsRng, &gas_prices, &fee_tier, &change_address);

    let mut notes_by_asset_id = BTreeMap::new();
    for required in actions.balance_with_fee().required() {
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

    // Now iterate over the action list's imbalances to balance the transaction.
    while let Some(required) = actions.balance_with_fee().required().next() {
        // Find a single note to spend towards the required balance.
        let note = notes_by_asset_id
            .get_mut(&required.asset_id)
            .expect("we already made a notesrequest for each required asset")
            .pop()
            .ok_or_else(|| {
                anyhow!(
                    "ran out of notes to spend while planning transaction, need {} of asset {}",
                    required.amount,
                    required.asset_id,
                )
            })?;

        // Add a spend for that note to the action list.
        actions.push(SpendPlan::new(&mut OsRng, note.note, note.position));

        // Refresh the fee estimate and change outputs.
        actions.refresh_fee_and_change(&mut OsRng, &gas_prices, &fee_tier, &change_address);

        iterations = iterations + 1;
        if iterations > 100 {
            return Err(anyhow!("failed to plan transaction after 100 iterations").into());
        }
    }

    let mut memo = None;
    if let Some(pb_memo_plaintext) = request.memo {
        memo = Some(MemoPlan::new(&mut OsRng, pb_memo_plaintext.try_into()?));
    } else {
        // If a memo was not provided, but is required (because we have outputs),
        // auto-create one with the change address.
        memo = Some(MemoPlan::new(
            &mut OsRng,
            MemoPlaintext::new(change_address, String::new())?,
        ));
    }

    let fee = actions.compute_fee_estimate(&gas_prices, &fee_tier);

    let transaction_parameters = TransactionParameters {
        expiry_height: request.expiry_height,
        chain_id,
        fee,
    };

    let plan =
        mem::take(&mut actions).into_plan(&mut OsRng, &fmd_params, transaction_parameters, memo)?;

    Ok(serde_wasm_bindgen::to_value(&plan)?)
}

/// When planning an undelegate action, there may not be metadata yet in the
/// IndexedDB database for the unbonding token that the transaction will output.
/// That's because unbonding tokens are tied to a specific height. If unbonding
/// token metadata for a given validator and a given height doesn't exist yet,
/// we'll generate it here and save it to the database, so that the undelegate
/// action renders correctly in the transaction approval dialog.
async fn save_unbonding_token_metadata_if_needed(
    undelegate: &Undelegate,
    storage: &IndexedDBStorage,
) -> WasmResult<()> {
    let metadata = undelegate.unbonding_token().denom();

    save_metadata_if_needed(metadata, storage).await
}

/// When planning Dutch auction-related actions, there will not be metadata yet
/// in the IndexedDB database for the auction NFT that the transaction will
/// output. That's because auction NFTs are derived from information about the
/// auction (for example, an NFT corresponding to a newly started auction is
/// dervived from the auction description parameters, which include a nonce). So
/// we'll generate the metadata here and save it to the database, so that the
/// action renders correctly in the transaction approval dialog.
async fn save_auction_nft_metadata_if_needed(
    id: AuctionId,
    storage: &IndexedDBStorage,
    seq: u64,
) -> WasmResult<()> {
    let nft = AuctionNft::new(id, seq);
    let metadata = nft.metadata;

    save_metadata_if_needed(metadata, storage).await
}

async fn save_metadata_if_needed(metadata: Metadata, storage: &IndexedDBStorage) -> WasmResult<()> {
    if storage.get_asset(&metadata.id()).await?.is_none() {
        let metadata_proto = metadata.to_proto();
        let customized_metadata_proto = customize_symbol_inner(metadata_proto)?;
        let customized_metadata = Metadata::try_from(customized_metadata_proto)?;
        storage.add_asset(&customized_metadata).await
    } else {
        Ok(())
    }
}
