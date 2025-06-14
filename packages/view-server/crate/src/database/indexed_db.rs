use std::future::IntoFuture;

use indexed_db_futures::prelude::OpenDbRequest;
use indexed_db_futures::{IdbDatabase, IdbQuerySource};
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

    let db = db_req.into_future().await?;
    Ok(db)
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
