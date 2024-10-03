use std::collections::BTreeMap;

use indexed_db_futures::IdbDatabase;
use penumbra_compact_block::{CompactBlock, StatePayload};
use penumbra_keys::{Address, FullViewingKey};
use penumbra_proto::DomainType;
use penumbra_sct::Nullifier;
use penumbra_shielded_pool::note;
use penumbra_tct as tct;
use penumbra_tct::Witness::*;
use serde::{Deserialize, Serialize};
use serde_wasm_bindgen::Serializer;
use tct::storage::{StoreCommitment, StoreHash, StoredPosition, Updates};
use tct::{Forgotten, Tree};
use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::JsValue;

use crate::error::WasmResult;
use crate::keys::is_controlled_inner;
use crate::note_record::SpendableNoteRecord;
use crate::storage::{init_idb_storage, Storage};
use crate::swap_record::SwapRecord;
use crate::utils;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct StoredTree {
    last_position: Option<StoredPosition>,
    last_forgotten: Option<Forgotten>,
    hashes: Vec<StoreHash>,
    commitments: Vec<StoreCommitment>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ScanBlockResult {
    height: u64,
    sct_updates: Updates,
    new_notes: Vec<SpendableNoteRecord>,
    new_swaps: Vec<SwapRecord>,
}

impl ScanBlockResult {
    pub fn new(
        height: u64,
        sct_updates: Updates,
        new_notes: Vec<SpendableNoteRecord>,
        new_swaps: Vec<SwapRecord>,
    ) -> ScanBlockResult {
        Self {
            height,
            sct_updates,
            new_notes,
            new_swaps,
        }
    }
}

#[wasm_bindgen]
pub struct ViewServer {
    latest_height: u64,
    fvk: FullViewingKey,
    notes: BTreeMap<note::StateCommitment, SpendableNoteRecord>,
    swaps: BTreeMap<tct::StateCommitment, SwapRecord>,
    sct: Tree,
    storage: Storage<IdbDatabase>,
    last_position: Option<StoredPosition>,
    last_forgotten: Option<Forgotten>,
}

#[wasm_bindgen]
impl ViewServer {
    /// Create new instances of `ViewServer`
    /// Function opens a connection to indexedDb
    /// Arguments:
    ///     full_viewing_key: `byte representation inner FullViewingKey`
    ///     epoch_duration: `u64`
    ///     stored_tree: `StoredTree`
    ///     idb_constants: `IndexedDbConstants`
    /// Returns: `ViewServer`
    #[wasm_bindgen]
    pub async fn new(
        full_viewing_key: &[u8],
        stored_tree: JsValue,
        idb_constants: JsValue,
    ) -> WasmResult<ViewServer> {
        utils::set_panic_hook();

        let fvk: FullViewingKey = FullViewingKey::decode(full_viewing_key)?;
        let stored_tree: StoredTree = serde_wasm_bindgen::from_value(stored_tree)?;
        let tree = load_tree(stored_tree);
        let constants = serde_wasm_bindgen::from_value(idb_constants)?;
        let view_server = Self {
            latest_height: u64::MAX,
            fvk,
            notes: Default::default(),
            sct: tree,
            swaps: Default::default(),
            storage: init_idb_storage(constants).await?,
            last_position: None,
            last_forgotten: None,
        };
        Ok(view_server)
    }

    /// Scans block for notes, swaps
    /// Returns true if the block contains new notes, swaps or false if the block is empty for us
    ///     compact_block: `v1::CompactBlock`
    /// Scan results are saved in-memory rather than returned
    /// Use `flush_updates()` to get the scan results
    /// Returns: `bool`
    #[wasm_bindgen]
    pub async fn scan_block(
        &mut self,
        compact_block: &[u8],
        skip_trial_decrypt: bool,
    ) -> WasmResult<bool> {
        utils::set_panic_hook();

        let block = CompactBlock::decode(compact_block)?;

        let mut found_new_data: bool = false;

        let mut note_advice = BTreeMap::new();
        let mut swap_advice = BTreeMap::new();

        // This structure allows all of the trial decryption to be done in one pass,
        // before processing any of the decrypted data. This makes it easier to skip
        // over an entire block with no known data.
        for state_payload in &block.state_payloads {
            match state_payload {
                StatePayload::Note { note: payload, .. } => {
                    let note_opt = (!skip_trial_decrypt)
                        .then(|| payload.trial_decrypt(&self.fvk))
                        .flatten();
                    if let Some(note) = note_opt {
                        // It's safe to avoid recomputing the note commitment here because
                        // trial_decrypt checks that the decrypted data is consistent
                        note_advice.insert(payload.note_commitment, note);
                    }
                }
                StatePayload::Swap { swap: payload, .. } => {
                    let swap_opt = (!skip_trial_decrypt)
                        .then(|| payload.trial_decrypt(&self.fvk))
                        .flatten();
                    if let Some(swap) = swap_opt {
                        // It's safe to avoid recomputing the note commitment here because
                        // trial_decrypt checks that the decrypted data is consistent
                        swap_advice.insert(payload.commitment, swap);
                    }
                }
                StatePayload::RolledUp { commitment, .. } => {
                    // Query the storage to find out if we have stored advice for this note commitment.
                    if let Some(note) = self.storage.read_advice(*commitment).await? {
                        note_advice.insert(*commitment, note);
                    }
                }
            }
        }

        if note_advice.is_empty() && swap_advice.is_empty() {
            // If there are no notes we care about in this block, just insert the block root into the
            // tree instead of processing each commitment individually
            self.sct
                .insert_block(block.block_root)
                .expect("inserting a block root must succeed");
        } else {
            // If we found at least one note for us in this block, we have to explicitly construct the
            // whole block in the SCT by inserting each commitment one at a time
            for payload in block.state_payloads.into_iter() {
                // We proceed commitment by commitment, querying our in-memory advice
                // to see if we have any data for the commitment and act accordingly.
                // We need to insert each commitment, so use a match statement to ensure we
                // exhaustively cover all possible cases.
                match (
                    note_advice.get(payload.commitment()),
                    swap_advice.get(payload.commitment()),
                ) {
                    (Some(note), None) => {
                        let position = self.sct.insert(Keep, *payload.commitment())?;

                        let source = payload.source().clone();
                        let nullifier = Nullifier::derive(
                            self.fvk.nullifier_key(),
                            position,
                            payload.commitment(),
                        );
                        let address_index = self
                            .fvk
                            .incoming()
                            .index_for_diversifier(note.diversifier());

                        let note_record = SpendableNoteRecord {
                            note_commitment: *payload.commitment(),
                            height_spent: None,
                            height_created: block.height,
                            note: note.clone(),
                            address_index,
                            nullifier,
                            position,
                            source,
                            return_address: None,
                        };
                        self.notes
                            .insert(*payload.commitment(), note_record.clone());

                        found_new_data = true;
                    }
                    (None, Some(swap)) => {
                        let position = self.sct.insert(Keep, *payload.commitment())?;
                        let output_data = *block
                            .swap_outputs
                            .get(&swap.trading_pair)
                            .ok_or_else(|| anyhow::anyhow!("server gave invalid compact block"))?;

                        let source = payload.source().clone();
                        let nullifier = Nullifier::derive(
                            self.fvk.nullifier_key(),
                            position,
                            payload.commitment(),
                        );

                        // Save the output notes that will be created by this swap as advice
                        // so that we can correctly detect the rolled-up output notes when they
                        // are claimed in the future.
                        let (output_1, output_2) = swap.output_notes(&output_data);
                        self.storage.store_advice(output_1).await?;
                        self.storage.store_advice(output_2).await?;

                        let swap_record = SwapRecord {
                            swap_commitment: *payload.commitment(),
                            swap: swap.clone(),
                            position,
                            nullifier,
                            source,
                            output_data,
                            height_claimed: None,
                        };
                        self.swaps.insert(*payload.commitment(), swap_record);

                        found_new_data = true;
                    }
                    (None, None) => {
                        // Don't remember this commitment; it wasn't ours, and
                        // it doesn't matter what kind of payload it was either.
                        // Just insert and forget
                        self.sct
                            .insert(tct::Witness::Forget, *payload.commitment())
                            .expect("inserting a commitment must succeed");
                    }
                    (Some(_), Some(_)) => unreachable!("swap and note commitments are distinct"),
                }
            }

            // End the block in the commitment tree
            self.sct.end_block().expect("ending the block must succed");
        }

        // If we've also reached the end of the epoch, end the epoch in the commitment tree
        if block.epoch_root.is_some() {
            self.sct.end_epoch().expect("ending the epoch must succeed");
        }

        self.latest_height = block.height;

        Ok(found_new_data)
    }

    /// Get new notes, swaps, SCT state updates
    /// Function also clears state
    /// Returns: `ScanBlockResult`
    #[wasm_bindgen]
    pub fn flush_updates(&mut self) -> WasmResult<JsValue> {
        utils::set_panic_hook();

        let sct_updates: Updates = self
            .sct
            .updates(
                self.last_position.unwrap_or_default(),
                self.last_forgotten.unwrap_or_default(),
            )
            .collect::<Updates>();

        let updates = ScanBlockResult {
            height: self.latest_height,
            sct_updates: sct_updates.clone(),
            new_notes: self.notes.clone().into_values().collect(),
            new_swaps: self.swaps.clone().into_values().collect(),
        };

        self.notes = Default::default();
        self.swaps = Default::default();

        self.last_position = sct_updates.set_position;
        self.last_forgotten = sct_updates.set_forgotten;

        let serializer = Serializer::new().serialize_large_number_types_as_bigints(true);
        let result = updates.serialize(&serializer)?;
        Ok(result)
    }

    /// SCT root can be compared with the root obtained by GRPC and verify that there is no divergence
    /// Returns: `Uint8Array representing a Root`
    #[wasm_bindgen]
    pub fn get_sct_root(&mut self) -> WasmResult<Vec<u8>> {
        utils::set_panic_hook();

        let root = self.sct.root();
        Ok(root.encode_to_vec())
    }

    /// Checks if address is controlled by view server full viewing key
    #[wasm_bindgen]
    pub fn is_controlled_address(&self, address: &[u8]) -> WasmResult<bool> {
        utils::set_panic_hook();

        let address: Address = Address::decode(address)?;
        Ok(is_controlled_inner(&self.fvk, &address))
    }
}

pub fn load_tree(stored_tree: StoredTree) -> Tree {
    let stored_position: StoredPosition = stored_tree.last_position.unwrap_or_default();
    let mut add_commitments = Tree::load(
        stored_position,
        stored_tree.last_forgotten.unwrap_or_default(),
    );

    for store_commitment in &stored_tree.commitments {
        add_commitments.insert(store_commitment.position, store_commitment.commitment)
    }
    let mut add_hashes = add_commitments.load_hashes();

    for stored_hash in &stored_tree.hashes {
        add_hashes.insert(stored_hash.position, stored_hash.height, stored_hash.hash);
    }
    add_hashes.finish()
}
