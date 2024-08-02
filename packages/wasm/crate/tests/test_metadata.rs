use penumbra_asset::asset::Metadata as MetadataDomainType;
use penumbra_proto::core::asset::v1::DenomUnit;
use penumbra_proto::{core::asset::v1::Metadata, DomainType};
use wasm_bindgen_test::wasm_bindgen_test;

wasm_bindgen_test::wasm_bindgen_test_configure!(run_in_browser);

pub fn get_metadata_for(display_denom: &str, base_denom_is_display_denom: bool) -> Metadata {
    let mut denom_units = Vec::new();
    denom_units.push(DenomUnit {
        aliases: Vec::new(),
        denom: if base_denom_is_display_denom {
            String::from(display_denom)
        } else {
            format!("u{display_denom}")
        },
        exponent: 0,
    });

    if !base_denom_is_display_denom {
        denom_units.push(DenomUnit {
            aliases: Vec::new(),
            denom: String::from(display_denom),
            exponent: 6,
        });
    }

    Metadata {
        base: if base_denom_is_display_denom {
            String::from(display_denom)
        } else {
            format!("u{display_denom}")
        },
        description: String::from(""),
        denom_units,
        display: String::from(display_denom),
        images: Vec::new(),
        name: String::from(""),
        penumbra_asset_id: None,
        symbol: String::from(""),
        priority_score: 0,
    }
}

#[wasm_bindgen_test]
fn it_interpolates_display_denom() {
    assert_eq!(get_metadata_for("penumbra", false).base, "upenumbra");
    assert_eq!(get_metadata_for("penumbra", false).display, "penumbra");
    assert_eq!(
        get_metadata_for("penumbra", false).denom_units[0].denom,
        "upenumbra"
    );
    assert_eq!(
        get_metadata_for("penumbra", false).denom_units[1].denom,
        "penumbra"
    );
}

use penumbra_wasm::metadata::customize_symbol_inner;

#[wasm_bindgen_test]
fn it_returns_non_staking_metadata_as_is() {
    let metadata = Metadata {
        name: String::from("Penumbra"),
        symbol: String::from("UM"),
        ..get_metadata_for("penumbra", false)
    };
    let customized_metadata = customize_symbol_inner(metadata.clone()).unwrap();

    assert_eq!(metadata, customized_metadata);
}

#[wasm_bindgen_test]
fn it_modifies_unbonding_token_symbol() {
    let metadata = Metadata {
        name: String::from("Unbonding Token"),
        symbol: String::from(""),
        ..get_metadata_for("unbonding_start_at_1234_penumbravalid1abcdef123456", false)
    };
    let customized_metadata = customize_symbol_inner(metadata.clone()).unwrap();

    assert_eq!(customized_metadata.symbol, "unbondUMat1234(abcdef123456)");
}

#[wasm_bindgen_test]
fn it_modifies_delegation_token_symbol() {
    let metadata = Metadata {
        name: String::from("Delegation Token"),
        symbol: String::from(""),
        ..get_metadata_for("delegation_penumbravalid1abcdef123456", false)
    };
    let customized_metadata = customize_symbol_inner(metadata.clone()).unwrap();

    assert_eq!(customized_metadata.symbol, "delUM(abcdef123456)");
}

#[wasm_bindgen_test]
fn it_modifies_auction_nft_symbol_with_seq_num() {
    let metadata = Metadata {
        name: String::from(""),
        symbol: String::from(""),
        ..get_metadata_for(
            "auctionnft_0_pauctid1jqyupqnzznyfpq940mv0ac33pyx77s7af3kgdw4nstjmp3567dks8n5amh",
            true,
        )
    };
    let customized_metadata = customize_symbol_inner(metadata.clone()).unwrap();

    assert_eq!(
        customized_metadata.symbol,
        "auction@0(jqyupqnzznyfpq940mv0ac33pyx77s7af3kgdw4nstjmp3567dks8n5amh)"
    );

    let metadata = Metadata {
        name: String::from(""),
        symbol: String::from(""),
        ..get_metadata_for(
            "auctionnft_123_pauctid1jqyupqnzznyfpq940mv0ac33pyx77s7af3kgdw4nstjmp3567dks8n5amh",
            true,
        )
    };
    let customized_metadata = customize_symbol_inner(metadata.clone()).unwrap();

    assert_eq!(
        customized_metadata.symbol,
        "auction@123(jqyupqnzznyfpq940mv0ac33pyx77s7af3kgdw4nstjmp3567dks8n5amh)"
    );
}

#[wasm_bindgen_test]
fn it_modifies_voting_receipt_token() {
    let metadata = Metadata {
        name: String::from(""),
        symbol: String::from(""),
        ..get_metadata_for("voted_on_234", false)
    };
    let customized_metadata = customize_symbol_inner(metadata.clone()).unwrap();

    assert_eq!(customized_metadata.symbol, "VotedOn234");
}

use penumbra_wasm::metadata::customize_symbol;

#[wasm_bindgen_test]
/// `customize_symbol` is just a thin wrapper around
/// `customize_symbol_inner` that allows metadata to be passed in as a byte
/// array. So we'll just do a basic test to make sure it works as expected,
/// rather than exercising every use case.
fn it_works() {
    let metadata = Metadata {
        name: String::from("Delegation Token"),
        symbol: String::from(""),
        ..get_metadata_for("delegation_penumbravalid1abcdef123456", false)
    };
    let metadata_as_bytes = MetadataDomainType::try_from(metadata)
        .unwrap()
        .encode_to_vec();
    let customized_metadata_bytes = customize_symbol(&metadata_as_bytes).unwrap();
    let customized_metadata_result =
        MetadataDomainType::decode::<&[u8]>(&customized_metadata_bytes);
    let customized_metadata_proto = customized_metadata_result.unwrap().to_proto();

    assert_eq!(customized_metadata_proto.symbol, "delUM(abcdef123456)");
}
