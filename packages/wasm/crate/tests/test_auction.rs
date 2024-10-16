extern crate penumbra_wasm;
use ark_ff::Zero;
use decaf377::Fq;
use penumbra_asset::{
    asset::{Id, Metadata},
    Value,
};
use penumbra_auction::auction::dutch::DutchAuctionDescription;
use penumbra_num::Amount;
use penumbra_proto::DomainType;
use penumbra_wasm::auction::{get_auction_id, get_auction_nft_metadata};

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

    assert!(result_proto.symbol.starts_with("auction@1234("));
    assert!(result_proto.display.starts_with("auctionnft_1234_pauctid1"));
}
