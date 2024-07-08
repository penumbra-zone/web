use std::future::IntoFuture;

use indexed_db_futures::idb_object_store::IdbObjectStoreParameters;
use indexed_db_futures::prelude::{IdbOpenDbRequestLike, OpenDbRequest};
use indexed_db_futures::{IdbDatabase, IdbKeyPath, IdbQuerySource, IdbVersionChangeEvent};
use serde::de::DeserializeOwned;
use serde::Serialize;
use wasm_bindgen::JsValue;
use web_sys::IdbTransactionMode::Readwrite;

use crate::database::interface::Database;
use crate::error::WasmResult;
use crate::storage::DbConstants;

pub async fn open_idb_database(constants: &DbConstants) -> WasmResult<IdbDatabase> {
    #[allow(unused_mut)]
    let mut db_req: OpenDbRequest = IdbDatabase::open_u32(&constants.name, constants.version)?;

    // Conditionally mock sample `IdbDatabase` database for testing purposes
    #[cfg(feature = "mock-database")]
    let db_req = mock_test_database(db_req).into_future().await;

    let db = db_req.into_future().await?;
    Ok(db)
}

// Previous method of testing that requires features in prod code to seed indexed db for tests
// TODO: Swap out with new MockDb utility for testing
async fn mock_test_database(mut db_req: OpenDbRequest) -> OpenDbRequest {
    db_req.set_on_upgrade_needed(Some(|evt: &IdbVersionChangeEvent| -> Result<(), JsValue> {
        // Check if the object store exists; create it if it doesn't
        if evt.db().name() == "penumbra-db-wasm-test" {
            let note_key: JsValue = serde_wasm_bindgen::to_value("noteCommitment.inner")?;
            let note_object_store_params = IdbObjectStoreParameters::new()
                .key_path(Some(&IdbKeyPath::new(note_key)))
                .to_owned();
            let note_object_store = evt
                .db()
                .create_object_store_with_params("SPENDABLE_NOTES", &note_object_store_params)?;

            let nullifier_key: JsValue = serde_wasm_bindgen::to_value("nullifier.inner")?;
            note_object_store.create_index_with_params(
                "nullifier",
                &IdbKeyPath::new(nullifier_key),
                web_sys::IdbIndexParameters::new().unique(false),
            )?;
            evt.db().create_object_store("TREE_LAST_POSITION")?;
            evt.db().create_object_store("TREE_LAST_FORGOTTEN")?;

            let commitment_key: JsValue = serde_wasm_bindgen::to_value("commitment.inner")?;
            let commitment_object_store_params = IdbObjectStoreParameters::new()
                .key_path(Some(&IdbKeyPath::new(commitment_key)))
                .to_owned();
            evt.db().create_object_store_with_params(
                "TREE_COMMITMENTS",
                &commitment_object_store_params,
            )?;
            evt.db().create_object_store("TREE_HASHES")?;
            evt.db().create_object_store("FMD_PARAMETERS")?;
            evt.db().create_object_store("APP_PARAMETERS")?;
            evt.db().create_object_store("GAS_PRICES")?;
        }
        Ok(())
    }));

    db_req
}

impl Database for IdbDatabase {
    async fn get<T, K>(&self, table: &str, key: K) -> WasmResult<Option<T>>
    where
        T: DeserializeOwned,
        K: Into<JsValue>,
    {
        let tx = self.transaction_on_one(table)?;
        let store = tx.object_store(table)?;
        let js_value = store.get_owned(key)?.await?;
        let result = js_value.map(serde_wasm_bindgen::from_value).transpose()?;
        Ok(result)
    }

    async fn get_with_index<T, K>(&self, table: &str, key: K, index: &str) -> WasmResult<Option<T>>
    where
        T: DeserializeOwned,
        K: Into<JsValue>,
    {
        let tx = self.transaction_on_one(table)?;
        let store = tx.object_store(table)?;
        let js_value = store.index(index)?.get_owned(key)?.await?;
        let result = js_value.map(serde_wasm_bindgen::from_value).transpose()?;
        Ok(result)
    }

    async fn get_latest<T>(&self, table: &str) -> WasmResult<Option<T>>
    where
        T: DeserializeOwned,
    {
        let tx = self.transaction_on_one(table)?;
        let store = tx.object_store(table)?;

        Ok(store
            .open_cursor_with_direction(web_sys::IdbCursorDirection::Prev)?
            .await?
            .and_then(|cursor| serde_wasm_bindgen::from_value(cursor.value()).ok()))
    }

    async fn get_all<T: DeserializeOwned>(&self, table: &str) -> WasmResult<Vec<T>> {
        let idb_tx = self.transaction_on_one(table)?;
        let store = idb_tx.object_store(table)?;
        let results = store.get_all()?.await?;
        let serialized = results
            .into_iter()
            .map(serde_wasm_bindgen::from_value)
            .collect::<Result<Vec<T>, _>>()?;
        Ok(serialized)
    }

    async fn put<V>(&self, table: &str, value: &V) -> WasmResult<()>
    where
        V: Serialize + ?Sized,
    {
        let tx = self.transaction_on_one_with_mode(table, Readwrite)?;
        let store = tx.object_store(table)?;
        let serialized = serde_wasm_bindgen::to_value(value)?;
        store.put_val_owned(serialized)?;
        Ok(())
    }

    async fn put_with_key<K, V>(&self, table: &str, key: K, value: &V) -> WasmResult<()>
    where
        K: Into<JsValue>,
        V: Serialize + ?Sized,
    {
        let tx = self.transaction_on_one_with_mode(table, Readwrite)?;
        let store = tx.object_store(table)?;
        let serialized = serde_wasm_bindgen::to_value(value)?;
        store.put_key_val_owned(key, &serialized)?;
        Ok(())
    }
}
