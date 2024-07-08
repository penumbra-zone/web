use std::collections::BTreeMap;
#[allow(unused_imports)]
use std::future::IntoFuture;

use anyhow::anyhow;
use indexed_db_futures::IdbDatabase;
use penumbra_asset::asset::{Id, Metadata};
use penumbra_auction::auction::AuctionId;
use penumbra_fee::GasPrices;
use penumbra_keys::keys::AddressIndex;
use penumbra_num::Amount;
use penumbra_proto::core::keys;
use penumbra_proto::{
    core::{app::v1::AppParameters, asset::v1::Value, component::sct::v1::Epoch},
    crypto::tct::v1::StateCommitment,
    view::v1::{NotesRequest, SwapRecord, TransactionInfo},
    DomainType,
};
use penumbra_sct::Nullifier;
use penumbra_shielded_pool::{fmd, note, Note};
use penumbra_stake::{DelegationToken, IdentityKey};
use serde::{Deserialize, Serialize};

use crate::database::indexed_db::open_idb_database;
use crate::database::interface::Database;
use crate::error::{WasmError, WasmResult};
use crate::note_record::SpendableNoteRecord;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct DbConstants {
    pub name: String,
    pub version: u32,
    pub tables: Tables,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Tables {
    pub assets: String,
    pub advice_notes: String,
    pub spendable_notes: String,
    pub swaps: String,
    pub fmd_parameters: String,
    pub app_parameters: String,
    pub gas_prices: String,
    pub epochs: String,
    pub transactions: String,
    pub full_sync_height: String,
    pub auctions: String,
    pub auction_outstanding_reserves: String,
}

pub async fn init_idb_storage(constants: DbConstants) -> WasmResult<Storage<IdbDatabase>> {
    let db = open_idb_database(&constants).await?;
    Storage::new(db, constants.tables)
}

pub struct Storage<T: Database> {
    db: T,
    tables: Tables,
}

impl<T: Database> Storage<T> {
    pub fn new(db: T, tables: Tables) -> WasmResult<Self> {
        Ok(Storage { db, tables })
    }

    pub fn get_database(&self) -> *const T {
        &self.db
    }

    pub async fn get_notes(&self, request: NotesRequest) -> WasmResult<Vec<SpendableNoteRecord>> {
        let asset_id: Option<Id> = request.asset_id.map(TryInto::try_into).transpose()?;
        let address_index: Option<AddressIndex> =
            request.address_index.map(TryInto::try_into).transpose()?;
        let amount_to_spend: Option<Amount> =
            request.amount_to_spend.map(TryInto::try_into).transpose()?;

        if let (None, Some(_)) = (asset_id, amount_to_spend) {
            return Err(
                anyhow::anyhow!("specified amount_to_spend without asset_id filter").into(),
            );
        }

        let mut filtered_records = Vec::new();
        let mut total = Amount::zero();

        let all_records = self
            .db
            .get_all::<SpendableNoteRecord>(&self.tables.spendable_notes)
            .await?;

        for record in all_records {
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
            filtered_records.push(record);

            if let Some(amount_to_spend) = amount_to_spend {
                if total >= amount_to_spend {
                    break;
                }
            }
        }

        Ok(filtered_records)
    }

    pub async fn get_asset(&self, id: &Id) -> WasmResult<Option<Metadata>> {
        let key = byte_array_to_base64(&id.to_proto().inner);
        let result: Option<Metadata> = self.db.get(&self.tables.assets, key).await?;
        Ok(result)
    }

    pub async fn add_asset(&self, metadata: &Metadata) -> WasmResult<()> {
        self.db.put(&self.tables.assets, metadata).await?;
        Ok(())
    }

    pub async fn get_full_sync_height(&self) -> WasmResult<Option<u64>> {
        let result = self.db.get(&self.tables.full_sync_height, "height").await?;
        Ok(result)
    }

    pub async fn get_note(
        &self,
        commitment: &note::StateCommitment,
    ) -> WasmResult<Option<SpendableNoteRecord>> {
        let key = byte_array_to_base64(&commitment.to_proto().inner);
        let result = self.db.get(&self.tables.spendable_notes, key).await?;
        Ok(result)
    }

    pub async fn get_note_by_nullifier(
        &self,
        nullifier: &Nullifier,
    ) -> WasmResult<Option<SpendableNoteRecord>> {
        let key = byte_array_to_base64(&nullifier.to_proto().inner);
        let result = self
            .db
            .get_with_index(&self.tables.spendable_notes, key, "nullifier")
            .await?;
        Ok(result)
    }

    pub async fn store_advice(&self, note: Note) -> WasmResult<()> {
        let key = byte_array_to_base64(&note.commit().to_proto().inner);
        self.db
            .put_with_key(&self.tables.advice_notes, key, &note)
            .await?;
        Ok(())
    }

    pub async fn read_advice(&self, commitment: note::StateCommitment) -> WasmResult<Option<Note>> {
        let key = byte_array_to_base64(&commitment.to_proto().inner);
        let result = self.db.get(&self.tables.advice_notes, key).await?;
        Ok(result)
    }

    pub async fn get_swap_by_commitment(
        &self,
        swap_commitment: StateCommitment,
    ) -> WasmResult<Option<SwapRecord>> {
        let key = byte_array_to_base64(&swap_commitment.inner);
        let result = self.db.get(&self.tables.advice_notes, key).await?;
        Ok(result)
    }

    pub async fn get_swap_by_nullifier(
        &self,
        nullifier: &Nullifier,
    ) -> WasmResult<Option<SwapRecord>> {
        let key = byte_array_to_base64(&nullifier.to_proto().inner);
        let result = self
            .db
            .get_with_index(&self.tables.swaps, key, "nullifier")
            .await?;
        Ok(result)
    }

    pub async fn get_fmd_params(&self) -> WasmResult<Option<fmd::Parameters>> {
        let result = self.db.get(&self.tables.fmd_parameters, "params").await?;
        Ok(result)
    }

    pub async fn get_app_params(&self) -> WasmResult<Option<AppParameters>> {
        let result = self.db.get(&self.tables.app_parameters, "params").await?;
        Ok(result)
    }

    pub async fn get_gas_prices_by_asset_id(&self, asset_id: &Id) -> WasmResult<Option<GasPrices>> {
        let key = byte_array_to_base64(&asset_id.to_proto().inner);
        let result = self.db.get(&self.tables.gas_prices, key).await?;
        Ok(result)
    }

    pub async fn get_latest_known_epoch(&self) -> WasmResult<Option<Epoch>> {
        let result = self.db.get_latest(&self.tables.epochs).await?;
        Ok(result)
    }

    pub async fn get_transaction_infos(&self) -> WasmResult<Vec<TransactionInfo>> {
        let all_txs = self
            .db
            .get_all::<TransactionInfo>(&self.tables.transactions)
            .await?;
        Ok(all_txs)
    }

    pub async fn get_auction_outstanding_reserves(
        &self,
        auction_id: AuctionId,
    ) -> WasmResult<OutstandingReserves> {
        let key = byte_array_to_base64(&auction_id.to_proto().inner);
        let result: Option<OutstandingReserves> = self
            .db
            .get(&self.tables.auction_outstanding_reserves, key)
            .await?;

        result.ok_or_else(|| WasmError::Anyhow(anyhow!("could not find reserves")))
    }

    pub async fn get_delegation_assets(&self) -> WasmResult<BTreeMap<Id, DelegationToken>> {
        let all_metadata = self
            .db
            .get_all::<Metadata>(&self.tables.transactions)
            .await?;

        let mut assets: BTreeMap<Id, DelegationToken> = BTreeMap::new();

        for metadata in all_metadata {
            if let Ok(token) = DelegationToken::try_from(metadata.clone()) {
                assets.insert(metadata.id(), token);
            }
        }

        Ok(assets)
    }

    pub async fn get_notes_for_voting(
        &self,
        address_index: Option<keys::v1::AddressIndex>,
        votable_at_height: u64,
    ) -> WasmResult<Vec<(SpendableNoteRecord, IdentityKey)>> {
        let delegation_assets = self.get_delegation_assets().await?;

        let all_notes = self
            .get_notes(NotesRequest {
                include_spent: true,
                address_index,
                asset_id: None,
                amount_to_spend: None,
            })
            .await?;

        let mut notes_for_voting: Vec<(SpendableNoteRecord, IdentityKey)> = vec![];

        for record in all_notes {
            // Ensure note is a delegation asset
            let Some(delegation_token) = delegation_assets.get(&record.note.asset_id()) else {
                continue;
            };

            // Determine if the note can be used for voting
            let not_spent_before_vote = record
                .height_spent
                .map_or(true, |height_spent| height_spent >= votable_at_height);
            let created_before_vote = record.height_created < votable_at_height;

            if created_before_vote && not_spent_before_vote {
                notes_for_voting.push((record, delegation_token.validator()));
            }
        }

        Ok(notes_for_voting)
    }
}

pub fn byte_array_to_base64(byte_array: &Vec<u8>) -> String {
    base64::Engine::encode(&base64::engine::general_purpose::STANDARD, byte_array)
}

#[derive(Serialize, Deserialize)]
pub struct OutstandingReserves {
    pub input: Value,
    pub output: Value,
}
