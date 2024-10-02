use penumbra_asset::asset::Metadata;
use penumbra_auction::auction::{dutch::DutchAuctionDescription, AuctionId, AuctionNft};
use penumbra_proto::DomainType;
use wasm_bindgen::prelude::wasm_bindgen;

use crate::{error::WasmResult, metadata::customize_symbol_inner, utils};

/// Given a `Uint8Array` encoding of a `DutchAuctionDescription`, returns that
/// auction's ID.
#[wasm_bindgen]
pub fn get_auction_id(description: &[u8]) -> WasmResult<Vec<u8>> {
    utils::set_panic_hook();
    let description = DutchAuctionDescription::decode(description)?;
    Ok(description.id().encode_to_vec())
}

/// Given a `Uint8Array` encoding of an `AuctionId` (along with a sequence
/// number), returns the metadata for the auction NFT describing that auction
/// and its current sequence number.
#[wasm_bindgen]
pub fn get_auction_nft_metadata(auction_id: &[u8], seq: u64) -> WasmResult<Vec<u8>> {
    utils::set_panic_hook();
    let auction_id = AuctionId::decode(auction_id)?;
    let nft = AuctionNft::new(auction_id, seq);
    let metadata_proto = customize_symbol_inner(nft.metadata.to_proto())?;
    let metadata_domain_type = Metadata::try_from(metadata_proto)?;

    Ok(metadata_domain_type.encode_to_vec())
}
