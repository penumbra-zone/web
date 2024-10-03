use anyhow::anyhow;
use penumbra_asset::asset::Metadata as MetadataDomainType;
use penumbra_proto::{core::asset::v1::Metadata, DomainType};
use regex::Regex;
use wasm_bindgen::prelude::wasm_bindgen;

use crate::{error::WasmResult, utils};

pub static UNBONDING_TOKEN_REGEX: &str = "^uunbonding_(?P<data>start_at_(?P<start>[0-9]+)_(?P<validator>penumbravalid1(?P<id>[a-zA-HJ-NP-Z0-9]+)))$";
pub static DELEGATION_TOKEN_REGEX: &str =
    "^udelegation_(?P<data>penumbravalid1(?P<id>[a-zA-HJ-NP-Z0-9]+))$";
pub static AUCTION_NFT_REGEX: &str =
    "^auctionnft_(?P<data>(?<seq_num>[a-z_0-9]+)_pauctid1(?P<id>[a-zA-HJ-NP-Z0-9]+))$";
pub static VOTING_RECEIPT_REGEX: &str = "^uvoted_on_(?P<data>(?P<proposal_id>[0-9]+))$";
pub static LP_NFT_REGEX: &str = "^lpnft_(?P<lp_state>[a-z_0-9]+)_plpid1(?P<id>[a-zA-HJ-NP-Z0-9]+)$";

/// Given a binary-encoded `Metadata`, returns a new binary-encoded `Metadata`
/// with the symbol customized if the token is one of several specific types
/// that don't have built-in symbols.
#[wasm_bindgen]
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
    let auction_re = Regex::new(AUCTION_NFT_REGEX)?;
    let voting_re = Regex::new(VOTING_RECEIPT_REGEX)?;
    let lp_nft_re = Regex::new(LP_NFT_REGEX)?;

    if let Some(captures) = unbonding_re.captures(&metadata.base) {
        let asset_id = collect_id(&captures)?;
        let start_match = captures
            .name("start")
            .ok_or_else(|| anyhow!("<start> not matched in unbonding token regex"))?
            .as_str();

        return Ok(Metadata {
            symbol: format!("unbondUMat{start_match}({asset_id})"),
            ..metadata
        });
    } else if let Some(captures) = delegation_re.captures(&metadata.base) {
        let asset_id = collect_id(&captures)?;

        return Ok(Metadata {
            symbol: format!("delUM({asset_id})"),
            ..metadata
        });
    } else if let Some(captures) = auction_re.captures(&metadata.base) {
        let asset_id = collect_id(&captures)?;
        let seq_num = get_seq_num(&captures)?;

        return Ok(Metadata {
            symbol: format!("auction@{seq_num}({asset_id})"),
            ..metadata
        });
    } else if let Some(captures) = voting_re.captures(&metadata.base) {
        let proposal_id = get_proposal_id(&captures)?;

        return Ok(Metadata {
            symbol: format!("VotedOn{proposal_id}"),
            ..metadata
        });
    } else if let Some(captures) = lp_nft_re.captures(&metadata.base) {
        let (state, id) = get_lp_info(&captures)?;

        return Ok(Metadata {
            symbol: format!("lpNft:{state}({id})"),
            ..metadata
        });
    }

    Ok(metadata)
}

fn collect_id(captures: &regex::Captures) -> WasmResult<String> {
    let id_match = captures
        .name("id")
        .ok_or_else(|| anyhow!("<id> not matched in token regex"))?;
    Ok(id_match.as_str().to_string())
}

fn get_seq_num(captures: &regex::Captures) -> WasmResult<String> {
    Ok(captures
        .name("seq_num")
        .ok_or_else(|| anyhow!("<seq_num> not matched in auction NFT token regex"))?
        .as_str()
        .chars()
        .collect())
}

fn get_proposal_id(captures: &regex::Captures) -> WasmResult<String> {
    let id_match = captures
        .name("proposal_id")
        .ok_or_else(|| anyhow!("<proposal_id> not matched in token regex"))?;
    Ok(id_match.as_str().to_string())
}

fn get_lp_info(captures: &regex::Captures) -> WasmResult<(String, String)> {
    let state_match = captures
        .name("lp_state")
        .ok_or_else(|| anyhow!("<lp_state> not matched in token regex"))?;
    let id_match = captures
        .name("id")
        .ok_or_else(|| anyhow!("<id> not matched in lpnft token regex"))?;
    Ok((
        state_match.as_str().to_string(),
        id_match.as_str().to_string(),
    ))
}
