use std::str::FromStr;

use anyhow;
use penumbra_keys::keys::{Bip44Path, SeedPhrase, SpendKey};
use penumbra_keys::{Address, FullViewingKey};
use penumbra_proof_params::{
    CONVERT_PROOF_PROVING_KEY, DELEGATOR_VOTE_PROOF_PROVING_KEY, OUTPUT_PROOF_PROVING_KEY,
    SPEND_PROOF_PROVING_KEY, SWAPCLAIM_PROOF_PROVING_KEY, SWAP_PROOF_PROVING_KEY,
};
use penumbra_proto::core::keys::v1 as pb;
use rand_core::OsRng;
use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::js_sys::Uint8Array;

use crate::error::WasmResult;
use crate::utils;

/// Loads the proving key as a collection of bytes, and to sets the keys in memory
/// dynamicaly at runtime. Failure to bundle the proving keys in the wasm binary
/// or call the load function will fail to generate a proof. Consumers of this
/// function will additionally require downloading the proving key parameter `.bin`
/// file for each key type.
#[wasm_bindgen]
pub fn load_proving_key(parameters: JsValue, key_type: &str) -> WasmResult<()> {
    // Deserialize JsValue into Vec<u8>.
    let parameters_bytes: Vec<u8> = Uint8Array::new(&parameters).to_vec();

    // Map key type with proving keys.
    let proving_key_map = match key_type {
        "spend" => &SPEND_PROOF_PROVING_KEY,
        "output" => &OUTPUT_PROOF_PROVING_KEY,
        "delegator_vote" => &DELEGATOR_VOTE_PROOF_PROVING_KEY,
        "swap" => &SWAP_PROOF_PROVING_KEY,
        "swapclaim" => &SWAPCLAIM_PROOF_PROVING_KEY,
        "convert" => &CONVERT_PROOF_PROVING_KEY,
        _ => return Err(anyhow::anyhow!("Unsupported key type").into()),
    };

    // Load proving key.
    proving_key_map.try_load_unchecked(&parameters_bytes)?;
    Ok(())
}

/// generate a spend key from a seed phrase
/// Arguments:
///     seed_phrase: `string`
/// Returns: `SpendKey`
#[wasm_bindgen]
pub fn generate_spend_key(seed_phrase: &str) -> WasmResult<JsValue> {
    utils::set_panic_hook();

    let seed = SeedPhrase::from_str(seed_phrase)?;
    let path = Bip44Path::new(0);
    let spend_key = SpendKey::from_seed_phrase_bip44(seed, &path);

    let result = serde_wasm_bindgen::to_value(&spend_key)?;
    Ok(result)
}

/// get full viewing key from spend key
/// Arguments:
///     spend_key: `SpendKey`
/// Returns: `FullViewingKey`
#[wasm_bindgen]
pub fn get_full_viewing_key(spend_key: JsValue) -> WasmResult<JsValue> {
    utils::set_panic_hook();

    let spend_key: SpendKey = serde_wasm_bindgen::from_value(spend_key)?;
    let fvk: &FullViewingKey = spend_key.full_viewing_key();
    let result = serde_wasm_bindgen::to_value(&fvk)?;
    Ok(result)
}

/// Wallet id: the hash of a full viewing key, used as an account identifier
/// Arguments:
///     full_viewing_key: `FullViewingKey`
/// Returns: `WalletId`
#[wasm_bindgen]
pub fn get_wallet_id(full_viewing_key: JsValue) -> WasmResult<JsValue> {
    utils::set_panic_hook();

    let fvk: FullViewingKey = serde_wasm_bindgen::from_value(full_viewing_key)?;
    let result = serde_wasm_bindgen::to_value(&fvk.wallet_id())?;
    Ok(result)
}

/// get address by index using FVK
/// Arguments:
///     full_viewing_key: `FullViewingKey`
///     index: `u32`
/// Returns: `Address`
#[wasm_bindgen]
pub fn get_address_by_index(full_viewing_key: JsValue, index: u32) -> WasmResult<JsValue> {
    utils::set_panic_hook();

    let fvk: FullViewingKey = serde_wasm_bindgen::from_value(full_viewing_key)?;
    let (address, _dtk) = fvk.incoming().payment_address(index.into());
    let result = serde_wasm_bindgen::to_value(&address)?;
    Ok(result)
}

/// get ephemeral (randomizer) address using FVK
/// The derivation tree is like "spend key / address index / ephemeral address" so we must also pass index as an argument
/// Arguments:
///     full_viewing_key: `FullViewingKey`
///     index: `u32`
/// Returns: `Address`
#[wasm_bindgen]
pub fn get_ephemeral_address(full_viewing_key: JsValue, index: u32) -> WasmResult<JsValue> {
    utils::set_panic_hook();

    let fvk: FullViewingKey = serde_wasm_bindgen::from_value(full_viewing_key)?;
    let (address, _dtk) = fvk.ephemeral_address(OsRng, index.into());
    let result = serde_wasm_bindgen::to_value(&address)?;
    Ok(result)
}

/// Returns the AddressIndex of an address.
/// If it is not controlled by the FVK, it returns a `None`
/// Arguments:
///     full_viewing_key: `FullViewingKey`
///     address: `Address`
/// Returns: `Option<AddressIndex>`
#[wasm_bindgen]
pub fn get_index_by_address(full_viewing_key: JsValue, address: JsValue) -> WasmResult<JsValue> {
    utils::set_panic_hook();

    let address: Address = serde_wasm_bindgen::from_value(address)?;
    let fvk: FullViewingKey = serde_wasm_bindgen::from_value(full_viewing_key)?;
    let index: Option<pb::AddressIndex> = fvk.address_index(&address).map(Into::into);
    let result = serde_wasm_bindgen::to_value(&index)?;
    Ok(result)
}
