use std::future::Future;

use serde::de::DeserializeOwned;
use serde::Serialize;
use wasm_bindgen::JsValue;

use crate::error::WasmResult;

pub trait Database {
    fn get<T, K>(&self, table: &str, key: K) -> impl Future<Output = WasmResult<Option<T>>>
    where
        T: DeserializeOwned,
        K: Into<JsValue>;

    fn get_with_index<T, K>(
        &self,
        table: &str,
        key: K,
        index: &str,
    ) -> impl Future<Output = WasmResult<Option<T>>>
    where
        T: DeserializeOwned,
        K: Into<JsValue>;

    // Gets the most recent record in table
    fn get_latest<T>(&self, table: &str) -> impl Future<Output = WasmResult<Option<T>>>
    where
        T: DeserializeOwned;

    fn get_all<T: DeserializeOwned>(&self, table: &str)
        -> impl Future<Output = WasmResult<Vec<T>>>;

    fn put<V>(&self, table: &str, value: &V) -> impl Future<Output = WasmResult<()>>
    where
        V: Serialize + ?Sized;

    fn put_with_key<K, V>(
        &self,
        table: &str,
        key: K,
        value: &V,
    ) -> impl Future<Output = WasmResult<()>>
    where
        K: Into<JsValue>,
        V: Serialize + ?Sized;
}
