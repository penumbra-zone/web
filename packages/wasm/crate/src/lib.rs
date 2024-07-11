#![allow(dead_code)]
// Requires nightly.
#![cfg_attr(docsrs, feature(doc_auto_cfg))]

extern crate core;

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
