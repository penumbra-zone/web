use crate::{error::WasmResult, metadata::customize_symbol_inner, utils};
use penumbra_asset::asset::Metadata;
use penumbra_auction::auction::{dutch::DutchAuctionDescription, AuctionId, AuctionNft};
use penumbra_proto::DomainType;
use wasm_bindgen::prelude::wasm_bindgen;

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

#[cfg(test)]
mod tests {
    use ark_ff::Zero;
    use decaf377::Fq;
    use penumbra_asset::{
        asset::{Id, Metadata},
        Value,
    };
    use penumbra_auction::auction::dutch::DutchAuctionDescription;
    use penumbra_num::Amount;
    use penumbra_proto::DomainType;

    use crate::auction::get_auction_id;

    use super::get_auction_nft_metadata;

    #[test]
    fn it_gets_correct_id_and_metadata() {
        let description = DutchAuctionDescription {
            start_height: 0,
            end_height: 100,
            input: Value {
                amount: Amount::default(),
                asset_id: Id(Fq::zero()),
            },
            min_output: Amount::default(),
            max_output: Amount::default(),
            nonce: [0; 32],
            output_id: Id(Fq::zero()),
            step_count: 100u64,
        };

        let auction_id_bytes = get_auction_id(&description.encode_to_vec()).unwrap();
        let result_bytes = get_auction_nft_metadata(&auction_id_bytes, 1234).unwrap();
        let result = Metadata::decode::<&[u8]>(&result_bytes).unwrap();
        let result_proto = result.to_proto();

        assert!(result_proto.symbol.starts_with("auction("));
        assert!(result_proto.display.starts_with("auctionnft_1234_pauctid1"));
    }
}
