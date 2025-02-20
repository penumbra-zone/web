use crate::error::WasmResult;
use crate::storage::{init_idb_storage, DbConstants};
use crate::utils;
use penumbra_keys::keys::AddressIndex;
use penumbra_proto::DomainType;
use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::JsValue;

/// Utility for requesting voting notes.
#[wasm_bindgen]
pub async fn get_voting_notes(
    address_index: &[u8],
    votable_at_height: u64,
    idb_constants: JsValue,
) -> WasmResult<JsValue> {
    utils::set_panic_hook();

    let constants: DbConstants = serde_wasm_bindgen::from_value(idb_constants)
        .expect("failed to convert idb_constants from JsValue to DbConstants");
    let storage = init_idb_storage(constants)
        .await
        .expect("failed to initialize IndexedDB storage");

    let address_index: AddressIndex =
        AddressIndex::decode(address_index).expect("failed to decode AddressIndex from byte slice");
    let proto_address_index = penumbra_proto::core::keys::v1::AddressIndex::from(address_index);

    let voting_notes: Vec<(
        crate::note_record::SpendableNoteRecord,
        penumbra_stake::IdentityKey,
    )> = storage
        .get_notes_for_voting(Some(proto_address_index), votable_at_height)
        .await
        .expect("failed to retrieve voting notes from storage");

    let result = serde_wasm_bindgen::to_value(&voting_notes)
        .expect("failed to convert voting notes to JsValue");
    Ok(result)
}
