use penumbra_proto_v2::core::component::compact_block::v1::query_service_client::QueryServiceClient;
use serde_wasm_bindgen::Error;
use tonic_web_wasm_client::Client;
use wasm_bindgen::JsValue;
use wasm_bindgen::prelude::wasm_bindgen;

use crate::utils;

#[wasm_bindgen]
pub async fn run_tonic_client() -> Result<JsValue, Error> {
    utils::set_panic_hook();

    let base_url = "https://grpc.testnet.penumbra.zone/";
    let tonic_wasm_client = Client::new(base_url.to_string());

    let query_client = QueryServiceClient::new(tonic_wasm_client.to_owned());

    let response = query_client.status().await;
}
