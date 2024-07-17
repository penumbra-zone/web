use std::str::FromStr;

use penumbra_asset::asset::Metadata;
use penumbra_asset::{Value, STAKING_TOKEN_ASSET_ID};
use penumbra_keys::Address;
use penumbra_keys::FullViewingKey;
use penumbra_proto::core::asset::v1 as pb;
use penumbra_proto::core::component::governance::v1::Vote;
use penumbra_proto::core::component::stake::v1::RateData;
use penumbra_proto::core::num::v1::Amount;
use penumbra_proto::view::v1::transaction_planner_request::DelegatorVote;
use penumbra_proto::view::v1::TransactionPlannerRequest;
use penumbra_sct::{CommitmentSource, Nullifier};
use penumbra_shielded_pool::Note;
use penumbra_stake::DelegationToken;
use penumbra_tct::StateCommitment;
use penumbra_transaction::ActionPlan;
use rand_core::OsRng;
use wasm_bindgen_test::wasm_bindgen_test;

use penumbra_wasm::database::interface::Database;
use penumbra_wasm::database::mock::{get_mock_tables, MockDb};
use penumbra_wasm::error::WasmError;
use penumbra_wasm::note_record::SpendableNoteRecord;
use penumbra_wasm::planner::plan_transaction_inner;
use penumbra_wasm::storage::{Storage, Tables};

use crate::utils::planner_setup::seed_params_in_db;

mod utils;

wasm_bindgen_test::wasm_bindgen_test_configure!(run_in_browser);

fn get_metadata_in_db() -> Metadata {
    let metadata_in_db_proto = pb::Metadata {
        base:
            "udelegation_penumbravalid1hz2hqlgx4w55vkxzv0n3u93czlkvm6zpgftyny2psg3dp8vcygxqd7fedt"
                .to_string(),
        ..Default::default()
    };
    metadata_in_db_proto.clone().try_into().unwrap()
}

async fn setup_env(mock_db: &MockDb, tables: &Tables) {
    seed_params_in_db(mock_db, tables).await;

    let metadata_in_db = get_metadata_in_db();

    mock_db
        .put_with_key(&tables.assets, "metadata_in_db", &metadata_in_db)
        .await
        .unwrap();

    let delegation_note = SpendableNoteRecord {
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
        .put_with_key(&tables.spendable_notes, "delegation_note", &delegation_note)
        .await
        .unwrap();

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
async fn test_delegator_votes_empty() {
    let mock_db = MockDb::new();
    let tables = get_mock_tables();

    seed_params_in_db(&mock_db, &tables).await;

    let storage = Storage::new(mock_db, tables).unwrap();

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
        delegator_votes: vec![DelegatorVote {
            proposal: 42,
            vote: None,
            start_block_height: 0,
            start_position: 0,
            rate_data: vec![],
        }],
        epoch_index: 0,
        epoch: None,
        fee_mode: None,
    };
    let full_viewing_key = FullViewingKey::from_str("penumbrafullviewingkey1mnm04x7yx5tyznswlp0sxs8nsxtgxr9p98dp0msuek8fzxuknuzawjpct8zdevcvm3tsph0wvsuw33x2q42e7sf29q904hwerma8xzgrxsgq2").unwrap();

    let fee_id = *STAKING_TOKEN_ASSET_ID;

    let res = plan_transaction_inner(storage, req, full_viewing_key, fee_id).await;
    assert!(matches!(
        res,
        Err(WasmError::Anyhow(e)) if e.to_string() == *"no notes were found for voting on proposal 42"
    ));
}

#[wasm_bindgen_test]
async fn test_no_rate_data_passed() {
    let mock_db = MockDb::new();
    let tables = get_mock_tables();

    setup_env(&mock_db, &tables).await;

    let storage = Storage::new(mock_db, tables).unwrap();

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
        delegator_votes: vec![DelegatorVote {
            proposal: 42,
            vote: None,
            start_block_height: 156,
            start_position: 0,
            rate_data: vec![],
        }],
        epoch_index: 0,
        epoch: None,
        fee_mode: None,
    };
    let full_viewing_key = FullViewingKey::from_str("penumbrafullviewingkey1mnm04x7yx5tyznswlp0sxs8nsxtgxr9p98dp0msuek8fzxuknuzawjpct8zdevcvm3tsph0wvsuw33x2q42e7sf29q904hwerma8xzgrxsgq2").unwrap();

    let fee_id = *STAKING_TOKEN_ASSET_ID;

    let res = plan_transaction_inner(storage, req, full_viewing_key, fee_id)
        .await
        .unwrap();
    assert_eq!(res.actions.len(), 0);
}

#[wasm_bindgen_test]
async fn test_rate_data_matches() {
    let mock_db = MockDb::new();
    let tables = get_mock_tables();

    setup_env(&mock_db, &tables).await;

    let storage = Storage::new(mock_db, tables).unwrap();

    let metadata_in_db = get_metadata_in_db();
    let del_token = DelegationToken::try_from(metadata_in_db.clone()).unwrap();

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
        delegator_votes: vec![DelegatorVote {
            proposal: 42,
            vote: Some(Vote { vote: 1 }),
            start_block_height: 156,
            start_position: 0,
            rate_data: vec![RateData {
                identity_key: Some(del_token.validator().into()),
                epoch_index: 0,
                validator_reward_rate: Some(Amount { lo: 23, hi: 2 }),
                validator_exchange_rate: Some(Amount { lo: 12, hi: 8 }),
            }],
        }],
        epoch_index: 0,
        epoch: None,
        fee_mode: None,
    };
    let full_viewing_key = FullViewingKey::from_str("penumbrafullviewingkey1mnm04x7yx5tyznswlp0sxs8nsxtgxr9p98dp0msuek8fzxuknuzawjpct8zdevcvm3tsph0wvsuw33x2q42e7sf29q904hwerma8xzgrxsgq2").unwrap();

    let res = plan_transaction_inner(storage, req, full_viewing_key, *STAKING_TOKEN_ASSET_ID)
        .await
        .unwrap();
    assert_eq!(res.actions.len(), 4);
    assert!(matches!(res.actions[0], ActionPlan::Spend(_)));
    assert!(matches!(res.actions[1], ActionPlan::Output(_)));
    assert!(matches!(res.actions[2], ActionPlan::Output(_)));

    if let ActionPlan::DelegatorVote(delegator_vote) = &res.actions[3] {
        assert_eq!(delegator_vote.proposal, 42);
    } else {
        panic!("Fourth action is not of type DelegatorVote");
    }
}
