use std::cell::RefCell;
use std::collections::HashMap;
use std::rc::Rc;

use serde::de::DeserializeOwned;
use serde::Serialize;
use wasm_bindgen::JsValue;

use crate::database::interface::Database;
use crate::error::WasmResult;
use crate::storage::Tables;

pub fn get_mock_tables() -> Tables {
    Tables {
        assets: "assets".to_string(),
        advice_notes: "advice_notes".to_string(),
        spendable_notes: "spendable_notes".to_string(),
        swaps: "swaps".to_string(),
        fmd_parameters: "fmd_parameters".to_string(),
        app_parameters: "app_parameters".to_string(),
        gas_prices: "gas_prices".to_string(),
        epochs: "epochs".to_string(),
        transactions: "transactions".to_string(),
        full_sync_height: "full_sync_height".to_string(),
        auctions: "auctions".to_string(),
        auction_outstanding_reserves: "auction_outstanding_reserves".to_string(),
    }
}

type DbTable = Rc<RefCell<HashMap<String, JsValue>>>;

pub struct MockDb {
    tables: RefCell<HashMap<String, DbTable>>,
}

impl Default for MockDb {
    fn default() -> Self {
        Self::new()
    }
}

impl MockDb {
    pub fn new() -> Self {
        MockDb {
            tables: RefCell::new(Default::default()),
        }
    }

    fn get_table(&self, table: &str) -> DbTable {
        let mut tables = self.tables.borrow_mut();
        tables
            .entry(table.to_string())
            .or_insert_with(|| Rc::new(RefCell::new(HashMap::new())))
            .clone()
    }
}

impl Database for MockDb {
    async fn get<T, K>(&self, table: &str, key: K) -> WasmResult<Option<T>>
    where
        T: DeserializeOwned,
        K: Into<JsValue>,
    {
        let table = self.get_table(table);
        let key = key.into().as_string().unwrap_or_default();

        let result = table
            .borrow()
            .get(&key)
            .and_then(|js_value| serde_wasm_bindgen::from_value(js_value.clone()).ok());

        Ok(result)
    }

    async fn get_with_index<T, K>(&self, _: &str, _: K, _: &str) -> WasmResult<Option<T>>
    where
        T: DeserializeOwned,
        K: Into<JsValue>,
    {
        // TODO: Implement mock method when test suite requires it
        unimplemented!()
    }

    async fn get_latest<T>(&self, _table: &str) -> WasmResult<Option<T>>
    where
        T: DeserializeOwned,
    {
        // TODO: Implement mock method when test suite requires it
        unimplemented!()
    }

    async fn get_all<T: DeserializeOwned>(&self, table: &str) -> WasmResult<Vec<T>> {
        let table = self.get_table(table);
        let table_ref = table.borrow();

        let mut results = Vec::new();
        for js_value in table_ref.values() {
            if let Ok(item) = serde_wasm_bindgen::from_value(js_value.clone()) {
                results.push(item);
            }
        }

        Ok(results)
    }

    async fn put<V>(&self, _table: &str, _value: &V) -> WasmResult<()>
    where
        V: Serialize + ?Sized,
    {
        // TODO: Implement mock method when test suite requires it
        unimplemented!()
    }

    async fn put_with_key<K, V>(&self, table: &str, key: K, value: &V) -> WasmResult<()>
    where
        K: Into<JsValue>,
        V: Serialize + ?Sized,
    {
        let table = self.get_table(table);
        let key = key.into().as_string().unwrap_or_default();
        let serialized = serde_wasm_bindgen::to_value(value)?;
        table.borrow_mut().insert(key, serialized);

        Ok(())
    }
}
