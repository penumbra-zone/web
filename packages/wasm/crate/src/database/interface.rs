use std::future::Future;

use serde::de::DeserializeOwned;
use wasm_bindgen::{JsCast, JsValue};

use crate::error::WasmResult;

pub trait Database {
    // TODO: get_with_index in addition to this?
    fn get<T, K>(
        &self,
        table: &str,
        key: K,
        index: Option<&str>,
    ) -> impl Future<Output = WasmResult<Option<T>>>
    where
        T: DeserializeOwned,
        K: Into<JsValue>;

    // TODO: add documentation
    fn get_latest<T>(&self, table: &str) -> impl Future<Output = WasmResult<Option<T>>>
    where
        T: DeserializeOwned;
    fn get_all<T: DeserializeOwned>(&self, table: &str)
        -> impl Future<Output = WasmResult<Vec<T>>>;
    fn put<V>(&self, table: &str, value: V) -> impl Future<Output = WasmResult<()>>
    where
        V: Into<JsValue>;

    fn put_with_key<K, V>(
        &self,
        table: &str,
        key: K,
        value: &V,
    ) -> impl Future<Output = WasmResult<()>>
    where
        K: Into<JsValue>,
        V: JsCast;
}
