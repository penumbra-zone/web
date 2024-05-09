#[allow(unused_imports)]
use std::future::IntoFuture;

use anyhow::Error;
use indexed_db_futures::{
    prelude::{IdbObjectStoreParameters, IdbOpenDbRequestLike, OpenDbRequest},
    IdbDatabase, IdbKeyPath, IdbQuerySource, IdbVersionChangeEvent,
};
use penumbra_asset::asset::{self, Id, Metadata};
use penumbra_auction::auction::AuctionId;
use penumbra_keys::keys::AddressIndex;
use penumbra_num::Amount;
use penumbra_proto::{
    core::{app::v1::AppParameters, asset::v1::Value, component::sct::v1::Epoch},
    crypto::tct::v1::StateCommitment,
    view::v1::{NotesRequest, SwapRecord, TransactionInfo},
    DomainType,
};
use penumbra_sct::Nullifier;
use penumbra_shielded_pool::{fmd, note, Note};
use serde::{Deserialize, Serialize};
use wasm_bindgen::JsValue;
use web_sys::IdbTransactionMode::Readwrite;

use crate::error::{WasmError, WasmResult};
use crate::note_record::SpendableNoteRecord;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct IndexedDbConstants {
    pub name: String,
    pub version: u32,
    pub tables: Tables,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Tables {
    pub assets: String,
    pub notes: String,
    pub spendable_notes: String,
    pub swaps: String,
    pub fmd_parameters: String,
    pub app_parameters: String,
    pub gas_prices: String,
    pub epochs: String,
    pub transactions: String,
    pub full_sync_height: String,
    pub auctions: String,
}

pub struct IndexedDBStorage {
    db: IdbDatabase,
    constants: IndexedDbConstants,
}

impl IndexedDBStorage {
    pub async fn new(constants: IndexedDbConstants) -> WasmResult<Self> {
        #[allow(unused_mut)]
        let mut db_req: OpenDbRequest = IdbDatabase::open_u32(&constants.name, constants.version)?;

        // Conditionally mock sample `IdbDatabase` database for testing purposes
        #[cfg(feature = "mock-database")]
        let db_req = IndexedDBStorage::mock_test_database(db_req)
            .into_future()
            .await;

        let db: IdbDatabase = db_req.into_future().await?;

        Ok(IndexedDBStorage { db, constants })
    }

    pub async fn mock_test_database(mut db_req: OpenDbRequest) -> OpenDbRequest {
        db_req.set_on_upgrade_needed(Some(|evt: &IdbVersionChangeEvent| -> Result<(), JsValue> {
            // Check if the object store exists; create it if it doesn't
            if evt.db().name() == "penumbra-db-wasm-test" {
                let note_key: JsValue = serde_wasm_bindgen::to_value("noteCommitment.inner")?;
                let note_object_store_params = IdbObjectStoreParameters::new()
                    .key_path(Some(&IdbKeyPath::new(note_key)))
                    .to_owned();
                let note_object_store = evt.db().create_object_store_with_params(
                    "SPENDABLE_NOTES",
                    &note_object_store_params,
                )?;

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

    pub fn get_database(&self) -> *const IdbDatabase {
        &self.db
    }

    pub async fn get_notes(&self, request: NotesRequest) -> WasmResult<Vec<SpendableNoteRecord>> {
        let idb_tx = self
            .db
            .transaction_on_one(&self.constants.tables.spendable_notes)?;
        let store = idb_tx.object_store(&self.constants.tables.spendable_notes)?;

        let asset_id: Option<asset::Id> = request.asset_id.map(TryInto::try_into).transpose()?;
        let address_index: Option<AddressIndex> =
            request.address_index.map(TryInto::try_into).transpose()?;
        let amount_to_spend: Option<Amount> =
            request.amount_to_spend.map(TryInto::try_into).transpose()?;

        if let (None, Some(_)) = (asset_id, amount_to_spend) {
            return Err(
                anyhow::anyhow!("specified amount_to_spend without asset_id filter").into(),
            );
        }

        let mut records = Vec::new();
        let mut total = Amount::zero();

        let raw_values = store.get_all()?.await?;
        for raw_record in raw_values {
            let record: SpendableNoteRecord = serde_wasm_bindgen::from_value(raw_record)?;

            if !request.include_spent && record.height_spent.is_some() {
                continue;
            }

            if Some(record.note.asset_id()) != asset_id {
                continue;
            }

            // Planner should omit the address index randomizer and compare only the account index
            if let Some(ai) = address_index {
                if record.address_index.account != ai.account {
                    continue;
                }
            }

            total += record.note.amount();
            records.push(record);

            if let Some(amount_to_spend) = amount_to_spend {
                if total >= amount_to_spend {
                    break;
                }
            }
        }

        Ok(records)
    }

    pub async fn get_asset(&self, id: &Id) -> WasmResult<Option<Metadata>> {
        let tx = self.db.transaction_on_one(&self.constants.tables.assets)?;
        let store = tx.object_store(&self.constants.tables.assets)?;

        Ok(store
            .get_owned(byte_array_to_base_64(&id.to_proto().inner))?
            .await?
            .map(serde_wasm_bindgen::from_value)
            .transpose()?)
    }

    pub async fn add_asset(&self, metadata: &Metadata) -> WasmResult<()> {
        let tx = self
            .db
            .transaction_on_one_with_mode(&self.constants.tables.assets, Readwrite)?;
        let store = tx.object_store(&self.constants.tables.assets)?;
        let metadata_js = serde_wasm_bindgen::to_value(&metadata.to_proto())?;

        store.put_val_owned(&metadata_js)?;

        Ok(())
    }

    pub async fn get_full_sync_height(&self) -> WasmResult<Option<u64>> {
        let tx = self
            .db
            .transaction_on_one(&self.constants.tables.full_sync_height)?;
        let store = tx.object_store(&self.constants.tables.full_sync_height)?;

        Ok(store
            .get_owned("height")?
            .await?
            .map(serde_wasm_bindgen::from_value)
            .transpose()?)
    }

    pub async fn get_note(
        &self,
        commitment: &note::StateCommitment,
    ) -> WasmResult<Option<SpendableNoteRecord>> {
        let tx = self
            .db
            .transaction_on_one(&self.constants.tables.spendable_notes)?;
        let store = tx.object_store(&self.constants.tables.spendable_notes)?;

        Ok(store
            .get_owned(byte_array_to_base_64(&commitment.to_proto().inner))?
            .await?
            .map(serde_wasm_bindgen::from_value)
            .transpose()?)
    }

    pub async fn get_note_by_nullifier(
        &self,
        nullifier: &Nullifier,
    ) -> WasmResult<Option<SpendableNoteRecord>> {
        let tx = self
            .db
            .transaction_on_one(&self.constants.tables.spendable_notes)?;
        let store = tx.object_store(&self.constants.tables.spendable_notes)?;

        Ok(store
            .index("nullifier")?
            .get_owned(byte_array_to_base_64(&nullifier.to_proto().inner))?
            .await?
            .map(serde_wasm_bindgen::from_value)
            .transpose()?)
    }

    pub async fn store_advice(&self, note: Note) -> WasmResult<()> {
        let tx = self
            .db
            .transaction_on_one_with_mode(&self.constants.tables.notes, Readwrite)?;
        let store = tx.object_store(&self.constants.tables.notes)?;

        let note_proto: penumbra_proto::core::component::shielded_pool::v1::Note =
            note.clone().into();
        let note_js = serde_wasm_bindgen::to_value(&note_proto)?;

        let commitment_proto = note.commit().to_proto();

        store.put_key_val_owned(byte_array_to_base_64(&commitment_proto.inner), &note_js)?;

        Ok(())
    }

    pub async fn read_advice(&self, commitment: note::StateCommitment) -> WasmResult<Option<Note>> {
        let tx = self.db.transaction_on_one(&self.constants.tables.notes)?;
        let store = tx.object_store(&self.constants.tables.notes)?;

        let commitment_proto = commitment.to_proto();

        Ok(store
            .get_owned(byte_array_to_base_64(&commitment_proto.inner))?
            .await?
            .map(serde_wasm_bindgen::from_value)
            .transpose()?)
    }

    pub async fn get_swap_by_commitment(
        &self,
        swap_commitment: StateCommitment,
    ) -> WasmResult<Option<SwapRecord>> {
        let tx = self.db.transaction_on_one(&self.constants.tables.swaps)?;
        let store = tx.object_store(&self.constants.tables.swaps)?;

        Ok(store
            .get_owned(byte_array_to_base_64(&swap_commitment.inner))?
            .await?
            .map(serde_wasm_bindgen::from_value)
            .transpose()?)
    }

    pub async fn get_swap_by_nullifier(
        &self,
        nullifier: &Nullifier,
    ) -> WasmResult<Option<SwapRecord>> {
        let tx = self.db.transaction_on_one(&self.constants.tables.swaps)?;
        let store = tx.object_store(&self.constants.tables.swaps)?;

        Ok(store
            .index("nullifier")?
            .get_owned(byte_array_to_base_64(&nullifier.to_proto().inner))?
            .await?
            .map(serde_wasm_bindgen::from_value)
            .transpose()?)
    }

    pub async fn get_fmd_params(&self) -> WasmResult<Option<fmd::Parameters>> {
        let tx = self
            .db
            .transaction_on_one(&self.constants.tables.fmd_parameters)?;
        let store = tx.object_store(&self.constants.tables.fmd_parameters)?;

        Ok(store
            .get_owned("params")?
            .await?
            .map(serde_wasm_bindgen::from_value)
            .transpose()?)
    }

    pub async fn get_app_params(&self) -> WasmResult<Option<AppParameters>> {
        let tx = self
            .db
            .transaction_on_one(&self.constants.tables.app_parameters)?;
        let store = tx.object_store(&self.constants.tables.app_parameters)?;

        Ok(store
            .get_owned("params")?
            .await?
            .map(serde_wasm_bindgen::from_value)
            .transpose()?)
    }

    pub async fn get_gas_prices(&self) -> WasmResult<Option<JsValue>> {
        let tx = self
            .db
            .transaction_on_one(&self.constants.tables.gas_prices)?;
        let store = tx.object_store(&self.constants.tables.gas_prices)?;

        Ok(store.get_owned("gas_prices")?.await?)
        // TODO GasPrices is missing domain type impl, requiring this
        // .map(serde_wasm_bindgen::from_value)
        // .transpose()?)
    }

    pub async fn get_latest_known_epoch(&self) -> WasmResult<Option<Epoch>> {
        let tx = self.db.transaction_on_one(&self.constants.tables.epochs)?;
        let store = tx.object_store(&self.constants.tables.epochs)?;

        Ok(store
            .open_cursor_with_direction(web_sys::IdbCursorDirection::Prev)?
            .await?
            .and_then(|cursor| serde_wasm_bindgen::from_value(cursor.value()).ok()))
    }

    pub async fn get_transaction_infos(&self) -> WasmResult<Vec<TransactionInfo>> {
        let tx = self
            .db
            .transaction_on_one(&self.constants.tables.transactions)?;
        let store = tx.object_store(&self.constants.tables.transactions)?;

        let mut records = Vec::new();
        let raw_values = store.get_all()?.await?;

        for raw_value in raw_values {
            let record: TransactionInfo = serde_wasm_bindgen::from_value(raw_value)?;
            records.push(record);
        }

        Ok(records)
    }

    pub async fn get_auction_oustanding_reserves(
        &self,
        auction_id: AuctionId,
    ) -> WasmResult<OutstandingReserves> {
        let tx = self
            .db
            .transaction_on_one(&self.constants.tables.auctions)?;
        let store = tx.object_store(&self.constants.tables.auctions)?;

        store
            .get::<JsValue>(&byte_array_to_base_64(&auction_id.to_proto().inner).into())?
            .await?
            .map(|auction| {
                serde_wasm_bindgen::from_value::<AuctionRecord>(auction)?
                    .outstanding_reserves
                    .ok_or(WasmError::Anyhow(Error::msg("could not find reserves")))
            })
            .unwrap_or(Err(WasmError::Anyhow(Error::msg(
                "could not find reserves",
            ))))
    }
}

fn byte_array_to_base_64(byte_array: &Vec<u8>) -> String {
    base64::Engine::encode(&base64::engine::general_purpose::STANDARD, byte_array)
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct AuctionRecord {
    pub outstanding_reserves: Option<OutstandingReserves>,
}

#[derive(Serialize, Deserialize)]
pub struct OutstandingReserves {
    pub input: Value,
    pub output: Value,
}
