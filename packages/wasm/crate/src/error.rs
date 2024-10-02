use std::num::TryFromIntError;

use penumbra_tct::error::InsertError;
use prost::DecodeError as ProstDecodeError;
use serde_wasm_bindgen::Error;
use thiserror::Error;
use wasm_bindgen::{JsError, JsValue};
use web_sys::DomException;

pub type WasmResult<T> = Result<T, WasmError>;

#[derive(Error, Debug)]
pub enum WasmError {
    #[error("{0}")]
    Anyhow(#[from] anyhow::Error),

    #[error("{0}")]
    Dom(#[from] DomError),

    #[error("{0}")]
    InsertError(#[from] InsertError),

    #[error("Decode error: {0}")]
    ProstDecodeError(#[from] ProstDecodeError),

    #[error("{0}")]
    RegexError(#[from] regex::Error),

    #[error("{0}")]
    TryInt(#[from] TryFromIntError),

    #[error("{0}")]
    Wasm(#[from] serde_wasm_bindgen::Error),
}

impl From<WasmError> for serde_wasm_bindgen::Error {
    fn from(wasm_err: WasmError) -> Self {
        Error::new(wasm_err.to_string())
    }
}

impl From<WasmError> for JsValue {
    fn from(error: WasmError) -> Self {
        JsError::from(error).into()
    }
}

#[derive(Debug)]
pub struct DomError(DomException);

impl std::fmt::Display for DomError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "DOM Exception: {:?}", self.0)
    }
}

impl std::error::Error for DomError {}

impl From<DomException> for WasmError {
    fn from(dom_exception: DomException) -> Self {
        WasmError::Dom(DomError(dom_exception))
    }
}
