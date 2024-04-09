use anyhow::anyhow;
use penumbra_asset::asset::Metadata as MetadataDomainType;
use penumbra_proto::{core::asset::v1::Metadata, DomainType};
use regex::Regex;
use wasm_bindgen::prelude::wasm_bindgen;

use crate::{error::WasmResult, utils};

pub static UNBONDING_TOKEN_REGEX: &str = "^uunbonding_(?P<data>start_at_(?P<start>[0-9]+)_(?P<validator>penumbravalid1(?P<id>[a-zA-HJ-NP-Z0-9]+)))$";
pub static DELEGATION_TOKEN_REGEX: &str =
    "^udelegation_(?P<data>penumbravalid1(?P<id>[a-zA-HJ-NP-Z0-9]+))$";
pub static SHORTENED_ID_LENGTH: usize = 8;

#[wasm_bindgen]
/// Given a binary-encoded `Metadata`, returns a new binary-encoded `Metadata`
/// with the symbol customized if the token is one of several specific types
/// that don't have built-in symbols.
pub fn customize_symbol(metadata_bytes: &[u8]) -> WasmResult<Vec<u8>> {
    utils::set_panic_hook();

    let metadata_domain_type = MetadataDomainType::decode(metadata_bytes)?;
    let metadata_proto = customize_symbol_inner(metadata_domain_type.to_proto())?;

    match MetadataDomainType::try_from(metadata_proto) {
        Ok(customized_metadata_domain_type) => Ok(customized_metadata_domain_type.encode_to_vec()),
        Err(error) => Err(error.into()),
    }
}

/// Given a `Metadata`, returns a new `Metadata` with the symbol customized if
/// the token is one of several specific types that don't have built-in symbols.
pub fn customize_symbol_inner(metadata: Metadata) -> WasmResult<Metadata> {
    let unbonding_re = Regex::new(UNBONDING_TOKEN_REGEX)?;
    let delegation_re = Regex::new(DELEGATION_TOKEN_REGEX)?;

    if let Some(captures) = unbonding_re.captures(&metadata.base) {
        let shortened_id = shorten_id(&captures)?;
        let start_match = captures
            .name("start")
            .ok_or_else(|| anyhow!("<start> not matched in unbonding token regex"))?
            .as_str();

        return Ok(Metadata {
            symbol: format!("unbondUMat{start_match}({shortened_id}...)"),
            ..metadata
        });
    } else if let Some(captures) = delegation_re.captures(&metadata.base) {
        let shortened_id = shorten_id(&captures)?;

        return Ok(Metadata {
            symbol: format!("delUM({shortened_id}...)"),
            ..metadata
        });
    }

    Ok(metadata)
}

fn shorten_id(captures: &regex::Captures) -> WasmResult<String> {
    let id_match = captures
        .name("id")
        .ok_or_else(|| anyhow!("<id> not matched in staking token regex"))?;
    Ok(id_match
        .as_str()
        .chars()
        .take(SHORTENED_ID_LENGTH)
        .collect())
}
