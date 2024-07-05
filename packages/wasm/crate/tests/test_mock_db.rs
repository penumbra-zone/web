use futures::executor::block_on;
use penumbra_keys::keys::AddressIndex;
use wasm_bindgen_test::wasm_bindgen_test;

use penumbra_wasm::database::interface::Database;
use penumbra_wasm::database::mock::MockDb;

wasm_bindgen_test::wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
fn test_get_and_put() {
    let db = MockDb::new();
    let table_name = "test_table";

    let key = "test_key";
    let value = AddressIndex::new(1);

    let serialized = serde_wasm_bindgen::to_value(&value).unwrap();

    block_on(db.put_with_key(table_name, key, &serialized)).unwrap();
    let retrieved: Option<AddressIndex> = block_on(db.get(table_name, key, None)).unwrap();

    assert_eq!(value, retrieved.unwrap());
}

#[wasm_bindgen_test]
fn test_get_all() {
    let db = MockDb::new();
    let table_name = "test_table_all";

    let values = vec![
        AddressIndex::new(1),
        AddressIndex::new(2),
        AddressIndex::new(3),
    ];

    for (i, value) in values.iter().enumerate() {
        let key = format!("test_key_{}", i);
        let serialized = serde_wasm_bindgen::to_value(value).unwrap();
        block_on(db.put_with_key(table_name, &key, &serialized)).unwrap();
    }

    let retrieved: Vec<AddressIndex> = block_on(db.get_all::<AddressIndex>(table_name)).unwrap();

    // Check every element in 'values' is present in 'retrieved' and vice versa
    assert_eq!(retrieved.len(), values.len());
    for item in &values {
        assert!(retrieved.contains(item));
    }
    for item in &retrieved {
        assert!(values.contains(item));
    }
}

#[wasm_bindgen_test]
fn test_multiple_tables() {
    let db = MockDb::new();
    let table1 = "table1";
    let table2 = "table2";

    let key1 = "key1";
    let value1 = AddressIndex::new(101);

    let key2 = "key2";
    let value2 = AddressIndex::new(202);

    let serialized1 = serde_wasm_bindgen::to_value(&value1).unwrap();
    let serialized2 = serde_wasm_bindgen::to_value(&value2).unwrap();

    block_on(db.put_with_key(table1, key1, &serialized1)).unwrap();
    block_on(db.put_with_key(table2, key2, &serialized2)).unwrap();

    let retrieved1: Option<AddressIndex> = block_on(db.get(table1, key1, None)).unwrap();
    let retrieved2: Option<AddressIndex> = block_on(db.get(table2, key2, None)).unwrap();

    assert_eq!(value1, retrieved1.unwrap());
    assert_eq!(value2, retrieved2.unwrap());
}
