use crate::utils;
use penumbra_dex::lp::position::{Id, Position};
use penumbra_dex::lp::LpNft;
use serde_wasm_bindgen::Error;
use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::JsValue;

/// compute position id
/// Arguments:
///     position: `Position`
/// Returns: `PositionId`
#[wasm_bindgen]
pub fn compute_position_id(position: JsValue) -> Result<JsValue, Error> {
    utils::set_panic_hook();

    let position: Position = serde_wasm_bindgen::from_value(position)?;
    serde_wasm_bindgen::to_value(&position.id())
}

/// get LP NFT asset
/// Arguments:
///     position_value: `lp::position::Position`
///     position_state_value: `lp::position::State`
/// Returns: `DenomMetadata`
#[wasm_bindgen]
pub fn get_lpnft_asset(
    position_id_value: JsValue,
    position_state_value: JsValue,
) -> Result<JsValue, Error> {
    utils::set_panic_hook();
    let position_id: Id = serde_wasm_bindgen::from_value(position_id_value)?;
    let position_state = serde_wasm_bindgen::from_value(position_state_value)?;
    let lp_nft = LpNft::new(position_id, position_state);
    let denom = lp_nft.denom();
    serde_wasm_bindgen::to_value(&denom)
}
