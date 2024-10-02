use crate::error::WasmResult;
use penumbra_asset::asset::Id;
use penumbra_proto::DomainType;
use wasm_bindgen::prelude::*;

/// generate the appropriate AssetId for a binary-serialized protobuf
/// `AssetId` potentially containing an `altBaseDenom` or `altBech32m` string
/// field
///
/// Arguments:
///     input_id_bin: `Uint8Array` representing a binary-serialized `AssetId`
///
/// Returns:
///     `Uint8Array` representing a binary-serialized `AssetId`
#[wasm_bindgen]
pub fn get_asset_id(input_id_bin: &[u8]) -> WasmResult<Vec<u8>> {
    let input_id = Id::decode(input_id_bin)?;
    Ok(input_id.encode_to_vec())
}
