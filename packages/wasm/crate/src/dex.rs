use penumbra_dex::lp::position::{Id, Position, State};
use penumbra_dex::lp::LpNft;
use penumbra_proto::DomainType;
use wasm_bindgen::prelude::wasm_bindgen;

use crate::error::WasmResult;
use crate::utils;

/// compute position id
/// Arguments:
///     position: `Uint8Array representing a Position`
/// Returns: ` Uint8Array representing a PositionId`
#[wasm_bindgen]
pub fn compute_position_id(position: &[u8]) -> WasmResult<Vec<u8>> {
    utils::set_panic_hook();

    let position = Position::decode(position)?;
    Ok(position.id().encode_to_vec())
}

/// get LP NFT asset
/// Arguments:
///     position_value: `lp::position::Position`
///     position_state_value: `lp::position::State`
/// Returns: `Uint8Array representing a DenomMetadata`
#[wasm_bindgen]
pub fn get_lpnft_asset(
    position_id_value: &[u8],
    position_state_value: &[u8],
) -> WasmResult<Vec<u8>> {
    utils::set_panic_hook();
    let position_id = Id::decode(position_id_value)?;
    let position_state = State::decode(position_state_value)?;
    let lp_nft = LpNft::new(position_id, position_state);
    let denom = lp_nft.denom();
    Ok(denom.encode_to_vec())
}
