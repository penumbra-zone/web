use penumbra_proto::DomainType;
use penumbra_sct::epoch::Epoch;
use penumbra_tct::Position;
use wasm_bindgen::prelude::wasm_bindgen;

use crate::error::WasmResult;

#[wasm_bindgen]
pub fn sct_position(block_height: u64, epoch_bytes: &[u8]) -> WasmResult<u64> {
    let epoch = Epoch::decode(epoch_bytes)?;
    let epoch_index = u16::try_from(epoch.index)?;
    // The block index is determined by looking at how many blocks have elapsed since
    // the start of the epoch.
    let block_index = u16::try_from(block_height - epoch.start_height)?;

    let position = Position::from((epoch_index, block_index, 0u16));
    Ok(position.into())
}
