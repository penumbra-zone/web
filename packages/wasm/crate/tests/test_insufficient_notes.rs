mod utils;
use crate::utils::planner_setup::seed_params_in_db;
use penumbra_asset::asset::Metadata;
use penumbra_asset::{Value, STAKING_TOKEN_ASSET_ID};
use penumbra_num::Amount;
use penumbra_proto::core::asset::v1 as pb;
use penumbra_wasm::database::interface::Database;
use penumbra_wasm::database::mock::{get_mock_tables, MockDb};
use penumbra_wasm::planner::insufficient_funds_err;
use penumbra_wasm::storage::{byte_array_to_base64, Storage};
use wasm_bindgen_test::wasm_bindgen_test;
wasm_bindgen_test::wasm_bindgen_test_configure!(run_in_browser);
use penumbra_proto::DomainType;

#[wasm_bindgen_test]
async fn test_insufficient_notes() {
    // Create a MockDb instance
    let mock_db = MockDb::new();
    let tables = get_mock_tables();
    seed_params_in_db(&mock_db, &tables).await;
    let storage = Storage::new(mock_db.clone(), tables.clone()).unwrap();

    let asset_id = *STAKING_TOKEN_ASSET_ID;
    let key = byte_array_to_base64(&asset_id.to_proto().inner);
    let metadata_in_db_proto = pb::Metadata {
        base: "uosmo".to_string(),
        ..Default::default()
    };
    let metadata_in_db: Metadata = metadata_in_db_proto.clone().try_into().unwrap();

    // Store the metadata in the mock database using the base64 key
    mock_db
        .put_with_key(&tables.assets, key, &metadata_in_db_proto)
        .await
        .unwrap();

    let required = Value {
        asset_id: metadata_in_db.id(),
        amount: Amount::from(100u64),
    };

    let error = insufficient_funds_err(&storage, &required).await;
    let error_message = format!("{}", error);
    assert_eq!(
        error_message,
        "Transaction failed due to insufficient funds"
    );
}
