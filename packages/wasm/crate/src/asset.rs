use crate::error::WasmResult;
use penumbra_asset::asset::Id;
use penumbra_proto::DomainType;
use wasm_bindgen::prelude::*;

/// generate the appropriate binary inner id for a binary-serialized protobuf
/// `AssetId` potentially containing an `altBaseDenom` or `altBech32m` string
/// field
///
/// Arguments:
///     input_id_bin: `Uint8Array` representing a binary-serialized `AssetId`
///
/// Returns:
///     `Uint8Array` representing the literal inner id
#[wasm_bindgen]
pub fn get_asset_id_inner(input_id_bin: &[u8]) -> WasmResult<Vec<u8>> {
    let input_id = Id::decode(input_id_bin)?;
    return Ok(input_id.to_bytes().to_vec());
}
