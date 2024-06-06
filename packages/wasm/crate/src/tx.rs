use std::collections::{BTreeMap, BTreeSet};
use std::convert::TryInto;

use anyhow::anyhow;
use penumbra_auction::auction::dutch::actions::view::{
    ActionDutchAuctionScheduleView, ActionDutchAuctionWithdrawView,
};
use penumbra_dex::BatchSwapOutputData;
use penumbra_keys::keys::SpendKey;
use penumbra_keys::FullViewingKey;
use penumbra_proto::core::transaction::v1::{TransactionPerspective, TransactionView};
use penumbra_proto::DomainType;
use penumbra_sct::{CommitmentSource, Nullifier};
use penumbra_tct::{Position, Proof, StateCommitment};
use penumbra_transaction::plan::TransactionPlan;
use penumbra_transaction::txhash::TransactionId;
use penumbra_transaction::Action;
use penumbra_transaction::{AuthorizationData, Transaction, WitnessData};
use rand_core::OsRng;
use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::JsValue;
use web_sys::js_sys;

use crate::error::{WasmError, WasmResult};
use crate::storage::IndexedDBStorage;
use crate::storage::IndexedDbConstants;
use crate::utils;
use crate::view_server::{load_tree, StoredTree};

/// authorize transaction (sign  transaction using  spend key)
/// Arguments:
///     spend_key: `byte representation inner SpendKey`
///     transaction_plan: `pb::TransactionPlan`
/// Returns: `pb::AuthorizationData`
#[wasm_bindgen]
pub fn authorize(spend_key: &[u8], transaction_plan: &[u8]) -> WasmResult<Vec<u8>> {
    utils::set_panic_hook();

    let spend_key: SpendKey = SpendKey::decode(spend_key)?;
    let plan = TransactionPlan::decode(transaction_plan)?;

    let auth_data: AuthorizationData = plan.authorize(OsRng, &spend_key)?;
    Ok(auth_data.encode_to_vec())
}

/// Get witness data
/// Obtaining witness data is directly related to SCT so we need to pass the tree data
/// Arguments:
///     transaction_plan: `pb::TransactionPlan`
///     stored_tree: `StoredTree`
/// Returns: `pb::WitnessData`
#[wasm_bindgen]
pub fn witness(transaction_plan: &[u8], stored_tree: JsValue) -> WasmResult<Vec<u8>> {
    utils::set_panic_hook();

    let plan = TransactionPlan::decode(transaction_plan)?;
    let stored_tree: StoredTree = serde_wasm_bindgen::from_value(stored_tree)?;
    let sct = load_tree(stored_tree);

    let note_commitments: Vec<StateCommitment> = plan
        .spend_plans()
        .filter(|plan| plan.note.amount() != 0u64.into())
        .map(|spend| spend.note.commit())
        .chain(
            plan.swap_claim_plans()
                .map(|swap_claim| swap_claim.swap_plaintext.swap_commitment()),
        )
        .collect();

    let anchor = sct.root();

    // Obtain an auth path for each requested note commitment

    let auth_paths = note_commitments
        .iter()
        .map(|nc| {
            sct.witness(*nc)
                .ok_or(anyhow!("note commitment is in the SCT"))
        })
        .collect::<Result<Vec<Proof>, anyhow::Error>>()?;

    // Release the read lock on the SCT
    drop(sct);

    let mut witness_data = WitnessData {
        anchor,
        state_commitment_proofs: auth_paths
            .into_iter()
            .map(|proof| (proof.commitment(), proof))
            .collect(),
    };

    // Now we need to augment the witness data with dummy proofs such that
    // note commitments corresponding to dummy spends also have proofs.
    for nc in plan
        .spend_plans()
        .filter(|plan| plan.note.amount() == 0u64.into())
        .map(|plan| plan.note.commit())
    {
        witness_data.add_proof(nc, Proof::dummy(&mut OsRng, nc));
    }

    Ok(witness_data.encode_to_vec())
}

/// Build serial tx
/// Building a transaction may take some time,
/// depending on CPU performance and number of actions in transaction_plan
/// Arguments:
///     full_viewing_key: `byte representation inner FullViewingKey`
///     transaction_plan: `pb::TransactionPlan`
///     witness_data: `pb::WitnessData`
///     auth_data: `pb::AuthorizationData`
/// Returns: `pb::Transaction`
#[wasm_bindgen]
pub fn build(
    full_viewing_key: &[u8],
    transaction_plan: &[u8],
    witness_data: &[u8],
    auth_data: &[u8],
) -> WasmResult<Vec<u8>> {
    utils::set_panic_hook();

    let plan = TransactionPlan::decode(transaction_plan)?;
    let witness = WitnessData::decode(witness_data)?;
    let auth = AuthorizationData::decode(auth_data)?;
    let fvk: FullViewingKey = FullViewingKey::decode(full_viewing_key)?;

    let tx: Transaction = plan.build(&fvk, &witness, &auth)?;

    Ok(tx.encode_to_vec())
}

/// Build parallel tx
/// Building a transaction may take some time,
/// depending on CPU performance and number of actions in transaction_plan
/// Arguments:
///     actions: `Vec<Actions>`
///     transaction_plan: `pb::TransactionPlan`
///     witness_data: `pb::WitnessData`
///     auth_data: `pb::AuthorizationData`
/// Returns: `pb::Transaction`
#[wasm_bindgen]
pub fn build_parallel(
    actions: JsValue,
    transaction_plan: &[u8],
    witness_data: &[u8],
    auth_data: &[u8],
) -> WasmResult<Vec<u8>> {
    utils::set_panic_hook();

    let plan = TransactionPlan::decode(transaction_plan)?;
    let witness = WitnessData::decode(witness_data)?;
    let auth = AuthorizationData::decode(auth_data)?;
    let actions: Vec<Action> = serde_wasm_bindgen::from_value(actions)?;

    let transaction = plan.clone().build_unauth_with_actions(actions, &witness)?;

    let tx = plan.apply_auth_data(&auth, transaction)?;

    Ok(tx.encode_to_vec())
}

#[wasm_bindgen(typescript_custom_section)]
const TRANSACTION_VIEW_PERSPECTIVE_TS: &'static str = r#"
export function transaction_perspective_and_view(full_viewing_key: Uint8Array, tx: Uint8Array, idb_constants: any): Promise<{ txp: Uint8Array, txv: Uint8Array }>;
"#;

#[wasm_bindgen(skip_typescript)]
pub async fn transaction_perspective_and_view(
    full_viewing_key: &[u8],
    tx: &[u8],
    idb_constants: JsValue,
) -> WasmResult<js_sys::Object> {
    utils::set_panic_hook();

    let transaction = Transaction::decode(tx)?;
    let constants = serde_wasm_bindgen::from_value(idb_constants)?;
    let fvk = FullViewingKey::decode(full_viewing_key)?;
    let (txp, txv) = transaction_info_inner(fvk, transaction, constants).await?;

    let response = js_sys::Object::new();

    js_sys::Reflect::set(
        &response,
        &"txp".into(),
        &js_sys::Uint8Array::from(prost::Message::encode_to_vec(&txp).as_slice()),
    )
    .expect("Must set txp");

    js_sys::Reflect::set(
        &response,
        &"txv".into(),
        &js_sys::Uint8Array::from(prost::Message::encode_to_vec(&txv).as_slice()),
    )
    .expect("Must set txv");

    Ok(response)
}

async fn transaction_info_inner(
    fvk: FullViewingKey,
    tx: Transaction,
    idb_constants: IndexedDbConstants,
) -> Result<(TransactionPerspective, TransactionView), WasmError> {
    let storage = IndexedDBStorage::new(idb_constants).await?;

    // First, create a TxP with the payload keys visible to our FVK and no other data.
    let mut txp = penumbra_transaction::TransactionPerspective {
        payload_keys: tx.payload_keys(&fvk)?,
        transaction_id: tx.id(),
        ..Default::default()
    };

    // Next, extend the TxP with the openings of commitments known to our view server
    // but not included in the transaction body, for instance spent notes or swap claim outputs.
    for action in tx.actions() {
        match action {
            Action::Spend(spend) => {
                let nullifier = spend.body.nullifier;
                // An error here indicates we don't know the nullifier, so we omit it from the Perspective.
                if let Some(spendable_note_record) =
                    storage.get_note_by_nullifier(&nullifier).await?
                {
                    txp.spend_nullifiers
                        .insert(nullifier, spendable_note_record.note.clone());
                }
            }
            Action::Swap(swap) => {
                let commitment = swap.body.payload.commitment;
                if let Some(swap_record) = storage.get_swap_by_commitment(commitment.into()).await?
                {
                    // Add swap output to perspective
                    if let Some(output_data) = swap_record.output_data {
                        let bsod = BatchSwapOutputData::try_from(output_data)?;
                        txp.batch_swap_output_data.push(bsod)
                    }

                    // Add swap claim to perspective
                    let swap_position = Position::from(swap_record.position);
                    add_swap_claim_txn_to_perspective(
                        &storage,
                        &fvk,
                        &mut txp,
                        &commitment,
                        swap_position,
                    )
                    .await?;
                }
            }
            Action::SwapClaim(claim) => {
                let nullifier = claim.body.nullifier;

                storage
                    .get_swap_by_nullifier(&nullifier)
                    .await?
                    .and_then(|swap_record| swap_record.source)
                    .into_iter()
                    .try_for_each(|source| {
                        let commitment_source: Result<CommitmentSource, anyhow::Error> =
                            source.try_into();
                        if let Some(id) = commitment_source.unwrap().id() {
                            txp.creation_transaction_ids_by_nullifier
                                .insert(nullifier, TransactionId(id));
                        }

                        Some(())
                    });

                let output_1_record = storage
                    .get_note(&claim.body.output_1_commitment)
                    .await?
                    .ok_or(anyhow!(
                        "Error generating TxP: SwapClaim output 1 commitment not found",
                    ))?;

                let output_2_record = storage
                    .get_note(&claim.body.output_2_commitment)
                    .await?
                    .ok_or(anyhow!(
                        "Error generating TxP: SwapClaim output 2 commitment not found"
                    ))?;

                txp.advice_notes
                    .insert(claim.body.output_1_commitment, output_1_record.note.clone());
                txp.advice_notes
                    .insert(claim.body.output_2_commitment, output_2_record.note.clone());
            }
            _ => {}
        }
    }

    // Now, generate a stub TxV from our minimal TxP, and inspect it to see what data we should
    // augment the minimal TxP with to provide additional context (e.g., filling in denoms for
    // visible asset IDs).
    let min_view = tx.view_from_perspective(&txp);
    let mut address_views = BTreeMap::new();
    let mut asset_ids = BTreeSet::new();
    for action_view in min_view.action_views() {
        use penumbra_dex::{swap::SwapView, swap_claim::SwapClaimView};
        use penumbra_transaction::view::action_view::{
            ActionView, DelegatorVoteView, OutputView, SpendView,
        };
        match action_view {
            ActionView::Spend(SpendView::Visible { note, .. }) => {
                address_views.insert(
                    note.address().encode_to_vec(),
                    fvk.view_address(note.address()),
                );
                asset_ids.insert(note.asset_id());
            }
            ActionView::Output(OutputView::Visible { note, .. }) => {
                address_views.insert(
                    note.address().encode_to_vec(),
                    fvk.view_address(note.address()),
                );
                asset_ids.insert(note.asset_id());

                // Also add an AddressView for the return address in the memo.
                let memo = tx.decrypt_memo(&fvk)?;
                address_views.insert(
                    memo.return_address().encode_to_vec(),
                    fvk.view_address(note.address()),
                );
            }
            ActionView::Swap(SwapView::Visible { swap_plaintext, .. }) => {
                let address = swap_plaintext.claim_address.clone();
                let address_view = fvk.view_address(swap_plaintext.claim_address.clone());
                address_views.insert(address.encode_to_vec(), address_view);
                asset_ids.insert(swap_plaintext.trading_pair.asset_1());
                asset_ids.insert(swap_plaintext.trading_pair.asset_2());
            }
            ActionView::SwapClaim(SwapClaimView::Visible {
                output_1, output_2, ..
            }) => {
                // Both will be sent to the same address so this only needs to be added once
                address_views.insert(
                    output_1.address().encode_to_vec(),
                    fvk.view_address(output_1.address()),
                );
                asset_ids.insert(output_1.asset_id());
                asset_ids.insert(output_2.asset_id());
            }
            ActionView::DelegatorVote(DelegatorVoteView::Visible { note, .. }) => {
                let address = note.address();
                let address_view = fvk.view_address(address.clone());
                address_views.insert(address.encode_to_vec(), address_view);
                asset_ids.insert(note.asset_id());
            }
            ActionView::ActionDutchAuctionSchedule(ActionDutchAuctionScheduleView {
                action,
                ..
            }) => {
                asset_ids.insert(action.description.output_id);
                asset_ids.insert(action.description.input.asset_id);
            }
            ActionView::ActionDutchAuctionWithdraw(ActionDutchAuctionWithdrawView {
                reserves,
                ..
            }) => reserves.iter().for_each(|reserve| {
                asset_ids.insert(reserve.asset_id());
            }),
            _ => {}
        }
    }

    // Now, extend the TxP with information helpful to understand the data it can view:

    let mut denoms = Vec::new();

    for id in asset_ids {
        if let Some(denom) = storage.get_asset(&id).await? {
            denoms.push(denom.clone());
        }
    }

    txp.denoms.extend(denoms.into_iter());

    txp.address_views = address_views.into_values().collect();

    // Finally, compute the full TxV from the full TxP:
    let txv = tx.view_from_perspective(&txp);

    Ok((txp.into(), txv.into()))
}

async fn add_swap_claim_txn_to_perspective(
    storage: &IndexedDBStorage,
    fvk: &FullViewingKey,
    txp: &mut penumbra_transaction::TransactionPerspective,
    commitment: &StateCommitment,
    swap_position: Position,
) -> Result<(), WasmError> {
    let derived_nullifier_from_swap =
        Nullifier::derive(fvk.nullifier_key(), swap_position, commitment);

    let transaction_infos = storage.get_transaction_infos().await?;

    for transaction_info in transaction_infos {
        transaction_info
            .transaction
            .and_then(|transaction| transaction.body)
            .iter()
            .for_each(|body| {
                for action in body.actions.iter() {
                    let tranasction_id = action
                        .action
                        .as_ref()
                        .and_then(|action| match action {
                            penumbra_proto::core::transaction::v1::action::Action::SwapClaim(
                                swap_claim,
                            ) => swap_claim.body.as_ref(),
                            _ => None,
                        })
                        .and_then(|body| body.nullifier.as_ref())
                        .filter(|&nullifier| nullifier == &derived_nullifier_from_swap.to_proto())
                        .and(transaction_info.id.as_ref())
                        .and_then(|id| TransactionId::try_from(id.clone()).ok());

                    if let Some(transaction_id) = tranasction_id {
                        txp.nullification_transaction_ids_by_commitment
                            .insert(*commitment, transaction_id);
                        break;
                    }
                }
            });
    }

    Ok(())
}
