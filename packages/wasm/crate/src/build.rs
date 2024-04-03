use penumbra_keys::FullViewingKey;
use penumbra_proto::DomainType;
use penumbra_transaction::{
    plan::{ActionPlan, TransactionPlan},
    WitnessData,
};
use wasm_bindgen::prelude::wasm_bindgen;

use crate::error::WasmResult;
use crate::utils;

/// Builds a planned [`Action`] specified by
/// the [`ActionPlan`] in a [`TransactionPlan`].
/// Arguments:
///     transaction_plan: `TransactionPlan`
///     action_plan: `ActionPlan`
///     full_viewing_key: `byte representation inner FullViewingKey`
///     witness_data: `WitnessData``
/// Returns: `Action`
#[wasm_bindgen]
pub fn build_action(
    transaction_plan: &[u8],
    action_plan: &[u8],
    full_viewing_key: &[u8],
    witness_data: &[u8],
) -> WasmResult<Vec<u8>> {
    utils::set_panic_hook();
    let transaction_plan = TransactionPlan::decode(transaction_plan)?;
    let witness = WitnessData::decode(witness_data)?;
    let action_plan = ActionPlan::decode(action_plan)?;
    let full_viewing_key: FullViewingKey = FullViewingKey::decode(full_viewing_key)?;

    let memo_key = transaction_plan.memo.map(|memo_plan| memo_plan.key);

    let action = ActionPlan::build_unauth(action_plan, &full_viewing_key, &witness, memo_key)?;
    Ok(action.encode_to_vec())
}
