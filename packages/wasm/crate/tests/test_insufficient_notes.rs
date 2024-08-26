mod utils;
use crate::utils::planner_setup::seed_params_in_db;
use decaf377::Fq;
use penumbra_asset::asset::Id;
use penumbra_asset::{Value, STAKING_TOKEN_ASSET_ID, STAKING_TOKEN_DENOM};
use penumbra_num::Amount;
use penumbra_proto::core::asset::v1 as pb;
use penumbra_wasm::database::interface::Database;
use penumbra_wasm::database::mock::{get_mock_tables, MockDb};
use penumbra_wasm::planner::insufficient_funds_err;
use penumbra_wasm::storage::{byte_array_to_base64, Storage};
use rand_core::OsRng;
use wasm_bindgen_test::wasm_bindgen_test;
wasm_bindgen_test::wasm_bindgen_test_configure!(run_in_browser);
use penumbra_proto::DomainType;

// TODO: add a test for database error when mock storage can support errors

#[wasm_bindgen_test]
// Asset id metadata is in storage and displays amount and denom
async fn metadata_in_storage_but_no_display_info() {
    let mock_db: MockDb = MockDb::new();
    let tables = get_mock_tables();
    seed_params_in_db(&mock_db, &tables).await;

    let asset_id_staking_token = *STAKING_TOKEN_ASSET_ID;

    let key = byte_array_to_base64(&asset_id_staking_token.to_proto().inner);
    let metadata_in_db_proto = pb::Metadata {
        base: asset_id_staking_token.to_string(),
        ..Default::default()
    };

    mock_db
        .put_with_key(&tables.assets, key.clone(), &metadata_in_db_proto)
        .await
        .unwrap();

    let storage = Storage::new(mock_db.clone(), tables.clone()).unwrap();

    let required = Value {
        asset_id: asset_id_staking_token,
        amount: Amount::from(100u64),
    };

    let error = insufficient_funds_err(&storage, &required).await;

    assert_eq!(
        format!("{}", error),
        format!(
            "Transaction failed due to insufficient funds. Required amount: 100 passet1984fctenw8m2fpl8a9wzguzp7j34d7vravryuhft808nyt9fdggqxmanqm."
        )
    );
}

#[wasm_bindgen_test]
// Asset id metadata is in storage and displays amount and denom
async fn metadata_in_storage() {
    let mock_db: MockDb = MockDb::new();
    let tables = get_mock_tables();
    seed_params_in_db(&mock_db, &tables).await;

    let asset_id_staking_token = *STAKING_TOKEN_ASSET_ID;

    let key = byte_array_to_base64(&asset_id_staking_token.to_proto().inner);
    // Store whole metadata struct
    let metadata_in_db_proto: pb::Metadata = STAKING_TOKEN_DENOM.clone().into();

    mock_db
        .put_with_key(&tables.assets, key.clone(), &metadata_in_db_proto)
        .await
        .unwrap();

    let storage = Storage::new(mock_db.clone(), tables.clone()).unwrap();

    let required = Value {
        asset_id: asset_id_staking_token,
        amount: Amount::from(100u64),
    };

    let error = insufficient_funds_err(&storage, &required).await;

    assert_eq!(
        format!("{}", error),
        // Note the decimal change
        "Transaction failed due to insufficient funds. Required amount: 0.0001 penumbra."
    );
}

#[wasm_bindgen_test]
// Asset id metadata is not in storage
async fn insufficient_notes_not_in_storage() {
    let mock_db = MockDb::new();
    let tables = get_mock_tables();
    seed_params_in_db(&mock_db, &tables).await;

    let asset_id_alternative_token = Id(Fq::rand(&mut OsRng));

    let storage = Storage::new(mock_db.clone(), tables.clone()).unwrap();

    let required = Value {
        asset_id: asset_id_alternative_token,
        amount: Amount::from(100u64),
    };

    let error = insufficient_funds_err(&storage, &required).await;
    let error_message = format!("{}", error);
    assert_eq!(
        error_message,
        "Transaction failed due to insufficient funds"
    );
}
