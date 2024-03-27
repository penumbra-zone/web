use wasm_bindgen::prelude::wasm_bindgen;

use penumbra_proto::DomainType;

use crate::error::WasmResult;
use crate::utils;

pub fn set_panic_hook() {
    // When the `console_error_panic_hook` feature is enabled, we can call the
    // `set_panic_hook` function at least once during initialization, and then
    // we will get better error messages if our code ever panics.
    //
    // For more details see
    // https://github.com/rustwasm/console_error_panic_hook#readme
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

/// decode SCT root
/// Arguments:
///     txId: `Uint8Array representing the hash of a transaction (TransactionId)`
/// Returns: `Uint8Array representing a penumbra_tct::Root`
#[wasm_bindgen]
pub fn decode_sct_root(tx: Vec<u8>) -> WasmResult<Vec<u8>> {
    utils::set_panic_hook();
    let root = penumbra_tct::Root::decode(tx.as_slice())?;
    Ok(root.encode_to_vec())
}
