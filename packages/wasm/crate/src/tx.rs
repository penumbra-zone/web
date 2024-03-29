use std::collections::{BTreeMap, BTreeSet};
use std::convert::TryInto;

use anyhow::anyhow;
use penumbra_dex::BatchSwapOutputData;
use penumbra_keys::keys::SpendKey;
use penumbra_keys::FullViewingKey;
use penumbra_proto::core::transaction::v1 as pb;
use penumbra_proto::core::transaction::v1::{TransactionPerspective, TransactionView};
use penumbra_proto::DomainType;
use penumbra_sct::{CommitmentSource, Nullifier};
use penumbra_tct::{Position, Proof, StateCommitment};
use penumbra_transaction::plan::TransactionPlan;
use penumbra_transaction::txhash::TransactionId;
use penumbra_transaction::Action;
use penumbra_transaction::{AuthorizationData, Transaction, WitnessData};
use rand_core::OsRng;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::JsValue;

use crate::error::{WasmError, WasmResult};
use crate::storage::IndexedDBStorage;
use crate::storage::IndexedDbConstants;
use crate::utils;
use crate::view_server::{load_tree, StoredTree};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct TxInfoResponse {
    txp: TransactionPerspective,
    txv: TransactionView,
}

impl TxInfoResponse {
    pub fn new(txp: TransactionPerspective, txv: TransactionView) -> TxInfoResponse {
        Self { txp, txv }
    }
}

/// encode transaction to bytes
/// Arguments:
///     transaction: `penumbra_transaction::Transaction`
/// Returns: `<Vec<u8>`
#[wasm_bindgen]
pub fn encode_tx(transaction: JsValue) -> WasmResult<JsValue> {
    utils::set_panic_hook();

    let tx: Transaction = serde_wasm_bindgen::from_value(transaction)?;
    let result = serde_wasm_bindgen::to_value::<Vec<u8>>(&tx.into())?;
    Ok(result)
}

/// decode base64 bytes to transaction
/// Arguments:
///     tx_bytes: `base64 String`
/// Returns: `penumbra_transaction::Transaction`
#[wasm_bindgen]
pub fn decode_tx(tx_bytes: &str) -> WasmResult<JsValue> {
    utils::set_panic_hook();

    let tx_vec: Vec<u8> =
        base64::Engine::decode(&base64::engine::general_purpose::STANDARD, tx_bytes)?;
    let transaction: Transaction = Transaction::try_from(tx_vec)?;
    let result = serde_wasm_bindgen::to_value(&transaction)?;
    Ok(result)
}

/// authorize transaction (sign  transaction using  spend key)
/// Arguments:
///     spend_key: `byte representation inner SpendKey`
///     transaction_plan: `pb::TransactionPlan`
/// Returns: `pb::AuthorizationData`
#[wasm_bindgen]
pub fn authorize(spend_key: &[u8], transaction_plan: JsValue) -> WasmResult<JsValue> {
    utils::set_panic_hook();

    let plan_proto: pb::TransactionPlan = serde_wasm_bindgen::from_value(transaction_plan)?;
    let spend_key: SpendKey = SpendKey::decode(spend_key)?;
    let plan: TransactionPlan = plan_proto.try_into()?;

    let auth_data: AuthorizationData = plan.authorize(OsRng, &spend_key)?;
    let result = serde_wasm_bindgen::to_value(&auth_data.to_proto())?;
    Ok(result)
}

/// Get witness data
/// Obtaining witness data is directly related to SCT so we need to pass the tree data
/// Arguments:
///     transaction_plan: `pb::TransactionPlan`
///     stored_tree: `StoredTree`
/// Returns: `pb::WitnessData`
#[wasm_bindgen]
pub fn witness(transaction_plan: JsValue, stored_tree: JsValue) -> WasmResult<JsValue> {
    utils::set_panic_hook();

    let plan_proto: pb::TransactionPlan = serde_wasm_bindgen::from_value(transaction_plan)?;

    let plan: TransactionPlan = plan_proto.try_into()?;

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

    let result = serde_wasm_bindgen::to_value(&witness_data.to_proto())?;
    Ok(result)
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
    transaction_plan: JsValue,
    witness_data: JsValue,
    auth_data: JsValue,
) -> WasmResult<JsValue> {
    utils::set_panic_hook();

    let plan_proto: pb::TransactionPlan = serde_wasm_bindgen::from_value(transaction_plan)?;
    let witness_data_proto: pb::WitnessData = serde_wasm_bindgen::from_value(witness_data)?;
    let auth_data_proto: pb::AuthorizationData = serde_wasm_bindgen::from_value(auth_data)?;

    let fvk: FullViewingKey = FullViewingKey::decode(full_viewing_key)?;

    let plan: TransactionPlan = plan_proto.try_into()?;

    let tx: Transaction = plan.build(
        &fvk,
        &witness_data_proto.try_into()?,
        &auth_data_proto.try_into()?,
    )?;

    let value = serde_wasm_bindgen::to_value(&tx.to_proto())?;

    Ok(value)
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
    transaction_plan: JsValue,
    witness_data: JsValue,
    auth_data: JsValue,
) -> WasmResult<JsValue> {
    utils::set_panic_hook();

    let plan: TransactionPlan = serde_wasm_bindgen::from_value(transaction_plan.clone())?;

    let witness_data_proto: pb::WitnessData = serde_wasm_bindgen::from_value(witness_data)?;
    let witness_data: WitnessData = witness_data_proto.try_into()?;

    let auth_data_proto: pb::AuthorizationData = serde_wasm_bindgen::from_value(auth_data)?;
    let auth_data: AuthorizationData = auth_data_proto.try_into()?;

    let actions: Vec<Action> = serde_wasm_bindgen::from_value(actions)?;

    let transaction = plan
        .clone()
        .build_unauth_with_actions(actions, &witness_data)?;

    let tx = plan.apply_auth_data(&auth_data, transaction)?;

    let value = serde_wasm_bindgen::to_value(&tx.to_proto())?;

    Ok(value)
}

/// Get transaction view, transaction perspective
/// Arguments:
///     full_viewing_key: `byte representation inner FullViewingKey`
///     tx: `pbt::Transaction`
///     idb_constants: IndexedDbConstants
/// Returns: `TxInfoResponse`
#[wasm_bindgen]
pub async fn transaction_info(
    full_viewing_key: &[u8],
    tx: JsValue,
    idb_constants: JsValue,
) -> WasmResult<JsValue> {
    utils::set_panic_hook();

    let transaction = serde_wasm_bindgen::from_value(tx)?;
    let constants = serde_wasm_bindgen::from_value(idb_constants)?;
    let fvk: FullViewingKey = FullViewingKey::decode(full_viewing_key)?;
    let response = transaction_info_inner(fvk, transaction, constants).await?;

    let result = serde_wasm_bindgen::to_value(&response)?;
    Ok(result)
}

pub async fn transaction_info_inner(
    fvk: FullViewingKey,
    tx: Transaction,
    idb_constants: IndexedDbConstants,
) -> WasmResult<TxInfoResponse> {
    let storage = IndexedDBStorage::new(idb_constants).await?;

    // First, create a TxP with the payload keys visible to our FVK and no other data.
    let mut txp = penumbra_transaction::TransactionPerspective {
        payload_keys: tx.payload_keys(&fvk)?,
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

                let swap_record = storage.get_swap_by_commitment(commitment.into()).await?;

                let swap_position_option = swap_record
                    .clone()
                    .map(|swap_record| Position::from(swap_record.position));

                swap_record
                    .clone()
                    .and_then(|swap_record| swap_record.output_data)
                    .map(|output_data| {
                        if let Ok(bsod) = BatchSwapOutputData::try_from(output_data) {
                            txp.batch_swap_output_data.push(bsod);
                        }
                    });

                if let Some(swap_position) = swap_position_option {
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
                let address = note.address();
                address_views.insert(address, fvk.view_address(address));
                asset_ids.insert(note.asset_id());
            }
            ActionView::Output(OutputView::Visible { note, .. }) => {
                let address = note.address();
                address_views.insert(address, fvk.view_address(address));
                asset_ids.insert(note.asset_id());

                // Also add an AddressView for the return address in the memo.
                let memo = tx.decrypt_memo(&fvk)?;
                address_views.insert(memo.return_address(), fvk.view_address(address));
            }
            ActionView::Swap(SwapView::Visible { swap_plaintext, .. }) => {
                let address = swap_plaintext.claim_address;
                address_views.insert(address, fvk.view_address(address));
                asset_ids.insert(swap_plaintext.trading_pair.asset_1());
                asset_ids.insert(swap_plaintext.trading_pair.asset_2());
            }
            ActionView::SwapClaim(SwapClaimView::Visible {
                output_1, output_2, ..
            }) => {
                // Both will be sent to the same address so this only needs to be added once
                let address = output_1.address();
                address_views.insert(address, fvk.view_address(address));
                asset_ids.insert(output_1.asset_id());
                asset_ids.insert(output_2.asset_id());
            }
            ActionView::DelegatorVote(DelegatorVoteView::Visible { note, .. }) => {
                let address = note.address();
                address_views.insert(address, fvk.view_address(address));
                asset_ids.insert(note.asset_id());
            }
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

    let response = TxInfoResponse {
        txp: txp.into(),
        txv: txv.into(),
    };
    Ok(response)
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
