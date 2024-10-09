use std::str::FromStr;

use anyhow;
use penumbra_keys::keys::{AddressIndex, Bip44Path, SeedPhrase, SpendKey};
use penumbra_keys::{Address, FullViewingKey};
use penumbra_proof_params::{
    CONVERT_PROOF_PROVING_KEY, DELEGATOR_VOTE_PROOF_PROVING_KEY, OUTPUT_PROOF_PROVING_KEY,
    SPEND_PROOF_PROVING_KEY, SWAPCLAIM_PROOF_PROVING_KEY, SWAP_PROOF_PROVING_KEY,
};
use penumbra_proto::core::keys::v1 as pb;
use penumbra_proto::DomainType;
use rand_core::OsRng;
use wasm_bindgen::prelude::*;

use crate::error::WasmResult;
use crate::utils;

/// Loads the proving key as a collection of bytes, and to sets the keys in memory
/// dynamicaly at runtime. Failure to bundle the proving keys in the wasm binary
/// or call the load function will fail to generate a proof. Consumers of this
/// function will additionally require downloading the proving key parameter `.bin`
/// file for each key type.
#[wasm_bindgen]
pub fn load_proving_key(key: &[u8], key_type: &str) -> WasmResult<()> {
    // Map key type with proving keys.
    let proving_key_map = match key_type {
        "spend" => &SPEND_PROOF_PROVING_KEY,
        "output" => &OUTPUT_PROOF_PROVING_KEY,
        "delegatorVote" => &DELEGATOR_VOTE_PROOF_PROVING_KEY,
        "swap" => &SWAP_PROOF_PROVING_KEY,
        "swapClaim" => &SWAPCLAIM_PROOF_PROVING_KEY,
        "undelegateClaim" => &CONVERT_PROOF_PROVING_KEY,
        _ => return Err(anyhow::anyhow!("Unsupported key type").into()),
    };

    // Load proving key.
    proving_key_map.try_load_unchecked(key)?;
    Ok(())
}

/// generate a spend key from a seed phrase
/// Arguments:
///     seed_phrase: `string`
/// Returns: `Uint8Array representing inner SpendKey`
#[wasm_bindgen]
pub fn generate_spend_key(seed_phrase: &str) -> WasmResult<Vec<u8>> {
    utils::set_panic_hook();

    let seed = SeedPhrase::from_str(seed_phrase)?;
    let path = Bip44Path::new(0);
    let spend_key = SpendKey::from_seed_phrase_bip44(seed, &path);
    Ok(spend_key.encode_to_vec())
}

/// get full viewing key from spend key
/// Arguments:
///     spend_key: `byte representation inner SpendKey`
/// Returns: `Uint8Array representing inner FullViewingKey`
#[wasm_bindgen]
pub fn get_full_viewing_key(spend_key: &[u8]) -> WasmResult<Vec<u8>> {
    utils::set_panic_hook();

    let spend_key: SpendKey = SpendKey::decode(spend_key)?;
    let fvk: &FullViewingKey = spend_key.full_viewing_key();
    Ok(fvk.encode_to_vec())
}

/// Wallet id: the hash of a full viewing key, used as an account identifier
/// Arguments:
///     full_viewing_key: `byte representation inner FullViewingKey`
/// Returns: `WalletId`
#[wasm_bindgen]
pub fn get_wallet_id(full_viewing_key: &[u8]) -> WasmResult<Vec<u8>> {
    utils::set_panic_hook();

    let fvk: FullViewingKey = FullViewingKey::decode(full_viewing_key)?;
    Ok(fvk.wallet_id().encode_to_vec())
}

/// get address by index using FVK
/// Arguments:
///     full_viewing_key: `byte representation inner FullViewingKey`
///     index: `u32`
/// Returns: `Uint8Array representing inner Address`
#[wasm_bindgen]
pub fn get_address_by_index(full_viewing_key: &[u8], index: u32) -> WasmResult<Vec<u8>> {
    utils::set_panic_hook();

    let fvk: FullViewingKey = FullViewingKey::decode(full_viewing_key)?;
    let (address, _dtk) = fvk.incoming().payment_address(index.into());
    Ok(address.encode_to_vec())
}

/// get ephemeral (randomizer) address using FVK
/// The derivation tree is like "spend key / address index / ephemeral address" so we must also pass index as an argument
/// Arguments:
///     full_viewing_key: `byte representation inner FullViewingKey`
///     index: `u32`
/// Returns: `Uint8Array representing inner Address`
#[wasm_bindgen]
pub fn get_ephemeral_address(full_viewing_key: &[u8], index: u32) -> WasmResult<Vec<u8>> {
    utils::set_panic_hook();

    let fvk: FullViewingKey = FullViewingKey::decode(full_viewing_key)?;
    let (address, _dtk) = fvk.ephemeral_address(OsRng, index.into());
    Ok(address.encode_to_vec())
}

/// Returns the AddressIndex of an address.
/// If it is not controlled by the FVK, it returns a `None`
/// Arguments:
///     full_viewing_key: `byte representation inner FullViewingKey`
///     address: `byte representation inner Address`
/// Returns: `Option<AddressIndex>`
#[wasm_bindgen]
pub fn get_index_by_address(full_viewing_key: &[u8], address: &[u8]) -> WasmResult<JsValue> {
    utils::set_panic_hook();

    let address: Address = Address::decode(address)?;
    let fvk: FullViewingKey = FullViewingKey::decode(full_viewing_key)?;
    let index: Option<pb::AddressIndex> = fvk.address_index(&address).map(Into::into);
    let result = serde_wasm_bindgen::to_value(&index)?;
    Ok(result)
}

/// Checks if address is controlled by full viewing key provided
#[wasm_bindgen]
pub fn is_controlled_address(full_viewing_key: &[u8], address: &[u8]) -> WasmResult<bool> {
    utils::set_panic_hook();

    let address: Address = Address::decode(address)?;
    let fvk: FullViewingKey = FullViewingKey::decode(full_viewing_key)?;
    Ok(is_controlled_inner(&fvk, &address))
}

pub fn is_controlled_inner(fvk: &FullViewingKey, address: &Address) -> bool {
    fvk.address_index(address).is_some()
}

/// Generates an address that can be used as a forwarding address for Noble
/// Returns: Uint8Array representing encoded Address
#[wasm_bindgen]
pub fn get_forwarding_address_for_sequence(
    sequence: u16,
    full_viewing_key: &[u8],
    account: Option<u32>,
) -> WasmResult<Vec<u8>> {
    let fvk: FullViewingKey = FullViewingKey::decode(full_viewing_key)?;
    let addr = forwarding_addr_inner(sequence, account, &fvk);
    Ok(addr.encode_to_vec())
}

/// Noble Randomizer: [0xff; 10] followed by LE16(sequence)
pub fn forwarding_addr_inner(sequence: u16, account: Option<u32>, fvk: &FullViewingKey) -> Address {
    let mut randomizer: [u8; 12] = [0xff; 12]; // Initialize all 12 bytes to 0xff
    let seq_bytes = sequence.to_le_bytes();
    randomizer[10..].copy_from_slice(&seq_bytes); // Replace the last 2 bytes with seq_bytes

    let index = AddressIndex {
        account: account.unwrap_or_default(),
        randomizer,
    };

    let (address, _dtk) = fvk.incoming().payment_address(index);

    address
}

/// Generates Bech32m noble address
#[wasm_bindgen]
pub fn generate_noble_addr(address: &[u8], channel: &str) -> WasmResult<String> {
    let address: Address = Address::decode(address)?;
    let forwarding_addr = address.noble_forwarding_address(channel);
    Ok(forwarding_addr.to_string())
}
