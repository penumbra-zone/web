use crate::error::WasmResult;
use crate::utils;
use penumbra_dex::lp::position::Id;
use penumbra_proto::DomainType;
use penumbra_stake::{DelegationToken, IdentityKey};
use wasm_bindgen::prelude::wasm_bindgen;

/// get delegation asset by validator identity key
/// Arguments:
///     validator_identity_key: `penumbra_stake::IdentityKey`
/// Returns: `Uint8Array` representing a `Metadata`
#[wasm_bindgen]
pub fn get_delegation_asset(validator_identity_key: &[u8]) -> WasmResult<Vec<u8>> {
    utils::set_panic_hook();
    let ik = IdentityKey::decode(validator_identity_key)?;
    let delegation_denom = DelegationToken::from(ik).denom();
    Ok(delegation_denom.encode_to_vec())
}
