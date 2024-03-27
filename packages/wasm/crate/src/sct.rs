use wasm_bindgen::prelude::wasm_bindgen;

use penumbra_proto::DomainType;

/// check validity of SCT root by attempting to parse it
/// Arguments:
///     root: `Uint8Array representing sct root hash`
/// Returns: boolean
#[wasm_bindgen]
pub fn valid_sct_root(root: Vec<u8>) -> bool {
    return penumbra_tct::Root::decode(root.as_slice()).is_ok();
}
