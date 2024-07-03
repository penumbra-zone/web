use futures::executor::block_on;
use penumbra_asset::asset::Metadata;
use penumbra_proto::core::asset::v1 as pb;
use wasm_bindgen_test::wasm_bindgen_test;

use penumbra_wasm::database::interface::Database;
use penumbra_wasm::database::mock::{get_mock_tables, MockDb};
use penumbra_wasm::storage::Storage;

wasm_bindgen_test::wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
fn test_get_delegation_assets_filters_correctly() {
    let mock_db = MockDb::new();
    let tables = get_mock_tables();

    let metadata_a_proto = pb::Metadata {
        base:
            "udelegation_penumbravalid1hz2hqlgx4w55vkxzv0n3u93czlkvm6zpgftyny2psg3dp8vcygxqd7fedt"
                .to_string(),
        ..Default::default()
    };
    let js_value_a = serde_wasm_bindgen::to_value(&metadata_a_proto).unwrap();
    block_on(mock_db.put_with_key(&tables.assets, "metadata_a", &js_value_a)).unwrap();

    let metadata_b_proto = pb::Metadata {
        base:
            "udelegation_penumbravalid18jfq3tvrnzpeuzj6yq25v4spmttc08gwjdtjk4r77xcsyyaz6c9qutgtch"
                .to_string(),
        ..Default::default()
    };
    let js_value_b = serde_wasm_bindgen::to_value(&metadata_b_proto).unwrap();
    block_on(mock_db.put_with_key(&tables.assets, "metadata_b", &js_value_b)).unwrap();

    let metadata_c_proto = pb::Metadata {
        base: "lpnft_opened_plpid1sp8a79edvlphkqgt8ps4p7mln8xx3wa2a84trudjur86cfd00mkq2350l9"
            .to_string(),
        ..Default::default()
    };
    let js_value_c = serde_wasm_bindgen::to_value(&metadata_c_proto).unwrap();
    block_on(mock_db.put_with_key(&tables.assets, "metadata_c", &js_value_c)).unwrap();

    let storage = Storage::new(mock_db, tables).unwrap();

    // Only two of the assets should have been returned
    let map = block_on(storage.get_delegation_assets()).unwrap();
    assert_eq!(map.len(), 2);

    // Ensure it's the two with udelegation... base denoms
    let metadata_a: Metadata = metadata_a_proto.try_into().unwrap();
    assert!(map.contains_key(&metadata_a.id()));

    let metadata_b: Metadata = metadata_b_proto.try_into().unwrap();
    assert!(map.contains_key(&metadata_b.id()));
}

#[wasm_bindgen_test]
fn test_get_notes_for_voting() {
    let mock_db = MockDb::new();
    let tables = get_mock_tables();

    let metadata_a_proto = pb::Metadata {
        base:
            "udelegation_penumbravalid1hz2hqlgx4w55vkxzv0n3u93czlkvm6zpgftyny2psg3dp8vcygxqd7fedt"
                .to_string(),
        ..Default::default()
    };
    let js_value_a = serde_wasm_bindgen::to_value(&metadata_a_proto).unwrap();
    block_on(mock_db.put_with_key(&tables.assets, "metadata_a", &js_value_a)).unwrap();

    let metadata_b_proto = pb::Metadata {
        base:
            "udelegation_penumbravalid18jfq3tvrnzpeuzj6yq25v4spmttc08gwjdtjk4r77xcsyyaz6c9qutgtch"
                .to_string(),
        ..Default::default()
    };
    let js_value_b = serde_wasm_bindgen::to_value(&metadata_b_proto).unwrap();
    block_on(mock_db.put_with_key(&tables.assets, "metadata_b", &js_value_b)).unwrap();

    // Need to add notes

    // let storage = Storage::new(mock_db, tables).unwrap();

    // Only two of the assets should have been returned
    // let map = block_on(storage.get_notes_for_voting()).unwrap();
    // assert_eq!(map.len(), 2);

    // Ensure it's the two with udelegation... base denoms
    // let metadata_a: Metadata = metadata_a_proto.try_into().unwrap();
    // assert!(map.get(&metadata_a.id()).is_some());

    // let metadata_b: Metadata = metadata_b_proto.try_into().unwrap();
    // assert!(map.get(&metadata_b.id()).is_some());
}
