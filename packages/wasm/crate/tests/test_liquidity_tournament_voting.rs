use crate::utils::planner_setup::seed_params_in_db;
use penumbra_asset::asset::Metadata;
use penumbra_asset::{Value, STAKING_TOKEN_ASSET_ID};
use penumbra_keys::Address;
use penumbra_keys::FullViewingKey;
use penumbra_proto::core::asset::v1 as pb;
use penumbra_proto::core::keys::v1::Address as AddressProto;
use penumbra_proto::view::v1::transaction_planner_request::ActionLiquidityTournamentVote;
use penumbra_proto::view::v1::{
    SpendableNoteRecord as SpendableNoteRecordProto, TransactionPlannerRequest,
};
use penumbra_sct::{CommitmentSource, Nullifier};
use penumbra_shielded_pool::Note;
use penumbra_tct::StateCommitment;
use penumbra_wasm::database::interface::Database;
use penumbra_wasm::database::mock::{get_mock_tables, MockDb};
use penumbra_wasm::error::WasmError;
use penumbra_wasm::note_record::SpendableNoteRecord;
use penumbra_wasm::planner::plan_transaction_inner;
use penumbra_wasm::storage::{Storage, Tables};
use rand_core::OsRng;
use std::str::FromStr;
use wasm_bindgen_test::wasm_bindgen_test;
mod utils;
wasm_bindgen_test::wasm_bindgen_test_configure!(run_in_browser);

async fn setup_env(mock_db: &MockDb, tables: &Tables) {
    seed_params_in_db(mock_db, tables).await;

    let fee_note = SpendableNoteRecord {
        note_commitment: StateCommitment::try_from([0; 32]).unwrap(),
        note: Note::generate(
            &mut OsRng,
            &Address::dummy(&mut OsRng),
            Value {
                amount: 1558828u64.into(),
                asset_id: *STAKING_TOKEN_ASSET_ID,
            },
        ),
        address_index: Default::default(),
        nullifier: Nullifier::try_from(vec![
            76, 12, 37, 160, 207, 93, 129, 238, 230, 254, 29, 227, 107, 97, 138, 12, 172, 130, 138,
            66, 123, 217, 253, 148, 178, 91, 112, 125, 247, 32, 189, 2,
        ])
        .unwrap(),
        height_created: 0,
        height_spent: None,
        position: Default::default(),
        source: CommitmentSource::Genesis,
        return_address: None,
    };

    mock_db
        .put_with_key(&tables.spendable_notes, "fee_note", &fee_note)
        .await
        .unwrap();
}

#[wasm_bindgen_test]
async fn test_liquidity_voting_no_delegation_notes() {
    let mock_db = MockDb::new();
    let tables = get_mock_tables();

    setup_env(&mock_db, &tables).await;

    let storage = Storage::new(mock_db, tables).unwrap();

    let notes = storage.get_notes_for_voting(None, 42).await.unwrap();
    let spendable_notes_proto: Vec<SpendableNoteRecordProto> =
        notes.into_iter().map(|(note, _)| note.into()).collect();

    let denom = pb::Denom {
        denom:
            "udelegation_penumbravalid1hz2hqlgx4w55vkxzv0n3u93czlkvm6zpgftyny2psg3dp8vcygxqd7fedt"
                .to_string(),
    };

    let rewards_recipient: AddressProto = Address::dummy(&mut OsRng).into();

    #[allow(deprecated)]
    let req = TransactionPlannerRequest {
        expiry_height: 0,
        memo: None,
        source: None,
        outputs: vec![],
        spends: vec![],
        swaps: vec![],
        swap_claims: vec![],
        delegations: vec![],
        undelegations: vec![],
        undelegation_claims: vec![],
        ibc_relay_actions: vec![],
        ics20_withdrawals: vec![],
        position_opens: vec![],
        position_closes: vec![],
        position_withdraws: vec![],
        dutch_auction_schedule_actions: vec![],
        dutch_auction_end_actions: vec![],
        dutch_auction_withdraw_actions: vec![],
        delegator_votes: vec![],
        action_liquidity_tournament_vote: vec![ActionLiquidityTournamentVote {
            incentivized: Some(denom),
            rewards_recipient: Some(rewards_recipient),
            staked_notes: spendable_notes_proto,
            epoch_index: 1,
        }],
        epoch_index: 1,
        epoch: None,
        fee_mode: None,
    };
    let full_viewing_key = FullViewingKey::from_str("penumbrafullviewingkey1mnm04x7yx5tyznswlp0sxs8nsxtgxr9p98dp0msuek8fzxuknuzawjpct8zdevcvm3tsph0wvsuw33x2q42e7sf29q904hwerma8xzgrxsgq2").unwrap();

    let fee_id = *STAKING_TOKEN_ASSET_ID;

    let res = plan_transaction_inner(storage, req, full_viewing_key, fee_id).await;
    assert!(matches!(
        res,
        Err(WasmError::Anyhow(e)) if e.to_string() == *"Invalid transaction: zero delegation notes for voting in the liquidity tournament"
    ));
}

#[wasm_bindgen_test]
async fn test_liquidity_voting_single_delegation_note() {
    let mock_db = MockDb::new();
    let tables = get_mock_tables();

    setup_env(&mock_db, &tables).await;

    let metadata_in_db_proto = pb::Metadata {
        base:
            "udelegation_penumbravalid1hz2hqlgx4w55vkxzv0n3u93czlkvm6zpgftyny2psg3dp8vcygxqd7fedt"
                .to_string(),
        ..Default::default()
    };
    let metadata_in_db: Metadata = metadata_in_db_proto.clone().try_into().unwrap();
    mock_db
        .put_with_key(&tables.assets, "metadata_a", &metadata_in_db_proto)
        .await
        .unwrap();

    let eligible_a = SpendableNoteRecord {
        note_commitment: StateCommitment::try_from([0; 32]).unwrap(),
        note: Note::generate(
            &mut OsRng,
            &Address::dummy(&mut OsRng),
            Value {
                amount: 50u64.into(),
                asset_id: metadata_in_db.id(),
            },
        ),
        address_index: Default::default(),
        nullifier: Nullifier::try_from(vec![
            76, 12, 37, 160, 207, 93, 129, 238, 230, 254, 29, 227, 107, 97, 138, 12, 172, 130, 138,
            66, 123, 217, 253, 148, 178, 91, 112, 125, 247, 32, 189, 2,
        ])
        .unwrap(),
        height_created: 0,
        height_spent: None,
        position: Default::default(),
        source: CommitmentSource::Genesis,
        return_address: None,
    };

    mock_db
        .put_with_key(&tables.spendable_notes, "eligible_a", &eligible_a)
        .await
        .unwrap();

    let storage = Storage::new(mock_db, tables).unwrap();

    let notes = storage.get_notes_for_voting(None, 42).await.unwrap();
    let spendable_notes: Vec<SpendableNoteRecord> =
        notes.clone().into_iter().map(|(note, _)| note).collect();
    let spendable_notes_proto: Vec<SpendableNoteRecordProto> =
        notes.into_iter().map(|(note, _)| note.into()).collect();

    assert_eq!(spendable_notes.len(), 1);

    let denom = pb::Denom {
        denom:
            "udelegation_penumbravalid1hz2hqlgx4w55vkxzv0n3u93czlkvm6zpgftyny2psg3dp8vcygxqd7fedt"
                .to_string(),
    };

    let rewards_recipient: AddressProto = Address::dummy(&mut OsRng).into();

    #[allow(deprecated)]
    let req = TransactionPlannerRequest {
        expiry_height: 0,
        memo: None,
        source: None,
        outputs: vec![],
        spends: vec![],
        swaps: vec![],
        swap_claims: vec![],
        delegations: vec![],
        undelegations: vec![],
        undelegation_claims: vec![],
        ibc_relay_actions: vec![],
        ics20_withdrawals: vec![],
        position_opens: vec![],
        position_closes: vec![],
        position_withdraws: vec![],
        dutch_auction_schedule_actions: vec![],
        dutch_auction_end_actions: vec![],
        dutch_auction_withdraw_actions: vec![],
        delegator_votes: vec![],
        action_liquidity_tournament_vote: vec![ActionLiquidityTournamentVote {
            incentivized: Some(denom),
            rewards_recipient: Some(rewards_recipient),
            staked_notes: spendable_notes_proto,
            epoch_index: 1,
        }],
        epoch_index: 1,
        epoch: None,
        fee_mode: None,
    };
    let full_viewing_key = FullViewingKey::from_str("penumbrafullviewingkey1mnm04x7yx5tyznswlp0sxs8nsxtgxr9p98dp0msuek8fzxuknuzawjpct8zdevcvm3tsph0wvsuw33x2q42e7sf29q904hwerma8xzgrxsgq2").unwrap();

    let fee_id = *STAKING_TOKEN_ASSET_ID;

    let res = plan_transaction_inner(storage, req, full_viewing_key, fee_id)
        .await
        .unwrap();

    assert_eq!(res.actions.len(), 3);
}

#[wasm_bindgen_test]
async fn test_liquidity_voting_multiple_delegation_note() {
    let mock_db = MockDb::new();
    let tables = get_mock_tables();

    setup_env(&mock_db, &tables).await;

    let metadata_in_db_proto = pb::Metadata {
        base:
            "udelegation_penumbravalid1hz2hqlgx4w55vkxzv0n3u93czlkvm6zpgftyny2psg3dp8vcygxqd7fedt"
                .to_string(),
        ..Default::default()
    };
    let metadata_in_db: Metadata = metadata_in_db_proto.clone().try_into().unwrap();
    mock_db
        .put_with_key(&tables.assets, "metadata_a", &metadata_in_db_proto)
        .await
        .unwrap();

    let eligible_a = SpendableNoteRecord {
        note_commitment: StateCommitment::try_from([0; 32]).unwrap(),
        note: Note::generate(
            &mut OsRng,
            &Address::dummy(&mut OsRng),
            Value {
                amount: 50u64.into(),
                asset_id: metadata_in_db.id(),
            },
        ),
        address_index: Default::default(),
        nullifier: Nullifier::try_from(vec![
            76, 12, 37, 160, 207, 93, 129, 238, 230, 254, 29, 227, 107, 97, 138, 12, 172, 130, 138,
            66, 123, 217, 253, 148, 178, 91, 112, 125, 247, 32, 189, 2,
        ])
        .unwrap(),
        height_created: 0,
        height_spent: None,
        position: Default::default(),
        source: CommitmentSource::Genesis,
        return_address: None,
    };

    mock_db
        .put_with_key(&tables.spendable_notes, "eligible_a", &eligible_a)
        .await
        .unwrap();

    let eligible_b = SpendableNoteRecord {
        note_commitment: StateCommitment::try_from([0; 32]).unwrap(),
        note: Note::generate(
            &mut OsRng,
            &Address::dummy(&mut OsRng),
            Value {
                amount: 50u64.into(),
                asset_id: metadata_in_db.id(),
            },
        ),
        address_index: Default::default(),
        nullifier: Nullifier::try_from(vec![
            76, 12, 37, 160, 207, 93, 129, 238, 230, 254, 29, 227, 107, 97, 138, 12, 172, 130, 138,
            66, 123, 217, 253, 148, 178, 91, 112, 125, 247, 32, 189, 2,
        ])
        .unwrap(),
        height_created: 40,
        height_spent: Some(42),
        position: Default::default(),
        source: CommitmentSource::Genesis,
        return_address: None,
    };

    mock_db
        .put_with_key(&tables.spendable_notes, "eligible_b", &eligible_b)
        .await
        .unwrap();

    let storage = Storage::new(mock_db, tables).unwrap();

    let notes = storage.get_notes_for_voting(None, 42).await.unwrap();
    let spendable_notes: Vec<SpendableNoteRecord> =
        notes.clone().into_iter().map(|(note, _)| note).collect();
    let spendable_notes_proto: Vec<SpendableNoteRecordProto> =
        notes.into_iter().map(|(note, _)| note.into()).collect();

    assert_eq!(spendable_notes.len(), 2);

    let denom = pb::Denom {
        denom:
            "udelegation_penumbravalid1hz2hqlgx4w55vkxzv0n3u93czlkvm6zpgftyny2psg3dp8vcygxqd7fedt"
                .to_string(),
    };

    let rewards_recipient: AddressProto = Address::dummy(&mut OsRng).into();

    #[allow(deprecated)]
    let req = TransactionPlannerRequest {
        expiry_height: 0,
        memo: None,
        source: None,
        outputs: vec![],
        spends: vec![],
        swaps: vec![],
        swap_claims: vec![],
        delegations: vec![],
        undelegations: vec![],
        undelegation_claims: vec![],
        ibc_relay_actions: vec![],
        ics20_withdrawals: vec![],
        position_opens: vec![],
        position_closes: vec![],
        position_withdraws: vec![],
        dutch_auction_schedule_actions: vec![],
        dutch_auction_end_actions: vec![],
        dutch_auction_withdraw_actions: vec![],
        delegator_votes: vec![],
        action_liquidity_tournament_vote: vec![ActionLiquidityTournamentVote {
            incentivized: Some(denom),
            rewards_recipient: Some(rewards_recipient),
            staked_notes: spendable_notes_proto,
            epoch_index: 1,
        }],
        epoch_index: 1,
        epoch: None,
        fee_mode: None,
    };
    let full_viewing_key = FullViewingKey::from_str("penumbrafullviewingkey1mnm04x7yx5tyznswlp0sxs8nsxtgxr9p98dp0msuek8fzxuknuzawjpct8zdevcvm3tsph0wvsuw33x2q42e7sf29q904hwerma8xzgrxsgq2").unwrap();

    let fee_id = *STAKING_TOKEN_ASSET_ID;

    let res = plan_transaction_inner(storage, req, full_viewing_key, fee_id)
        .await
        .unwrap();

    assert_eq!(res.actions.len(), 4);
}
