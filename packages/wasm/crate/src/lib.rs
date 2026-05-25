pub mod asset;
pub mod auction;
pub mod build;
pub mod database;
pub mod dex;
pub mod error;
pub mod keys;
pub mod metadata;
pub mod note_record;
pub mod planner;
pub mod stake;
pub mod storage;
pub mod swap_record;
pub mod tree;
pub mod tx;
pub mod utils;
pub mod view_server;
pub mod voting;

// Re-export wasm-bindgen-rayon's initThreadPool when parallel feature is enabled.
// This is required for the TypeScript side to initialize the thread pool.
#[cfg(feature = "parallel")]
pub use wasm_bindgen_rayon::init_thread_pool as initThreadPool;
