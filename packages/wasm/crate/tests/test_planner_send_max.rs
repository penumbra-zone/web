use crate::utils::planner_setup::seed_params_in_db;
use penumbra_asset::{Value, STAKING_TOKEN_ASSET_ID};
use penumbra_fee::GasPrices;
use penumbra_keys::Address;
use penumbra_keys::FullViewingKey;
use penumbra_proto::view::v1::transaction_planner_request::Spend;
use penumbra_proto::view::v1::TransactionPlannerRequest;
use penumbra_sct::{CommitmentSource, Nullifier};
use penumbra_shielded_pool::Note;
use penumbra_tct::StateCommitment;
use penumbra_wasm::database::interface::Database;
use penumbra_wasm::database::mock::{get_mock_tables, MockDb};
use penumbra_wasm::error::WasmError;
use penumbra_wasm::note_record::SpendableNoteRecord;
use penumbra_wasm::planner::plan_transaction_inner;
use penumbra_wasm::storage::{byte_array_to_base64, Storage, Tables};
use rand_core::OsRng;
use std::str::FromStr;
use wasm_bindgen_test::wasm_bindgen_test;
mod utils;
use penumbra_asset::asset::Metadata;
use penumbra_proto::core::asset::v1 as pb;
use penumbra_proto::DomainType;

wasm_bindgen_test::wasm_bindgen_test_configure!(run_in_browser);

/////////////////////////////////////////////// SETUP ENVIRONMENT //////////////////////////////////////////////////////
///                                                                                                                  ///
/// To comprehensively cover the domain space, construct various accounts with note balances comprising:             ///
///     1. Only the native staking token,                                                                            ///
///     2. Only the alternative fee token,                                                                           ///
///     3. Both the native staking token and the alternative fee token,                                              ///    
///     4. Empty note balance                                                                                        ///
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/// Populate database with only native staking token.
async fn setup_env_1(mock_db: &MockDb, tables: &Tables) {
    seed_params_in_db(mock_db, tables).await;

    let sender_address = &Address::dummy(&mut OsRng);

    let fee_note = SpendableNoteRecord {
        note_commitment: StateCommitment::try_from([0; 32]).unwrap(),
        note: Note::generate(
            &mut OsRng,
            sender_address,
            Value {
                amount: 1u64.into(),
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

    let fee_note_2 = SpendableNoteRecord {
        note_commitment: StateCommitment::try_from([0; 32]).unwrap(),
        note: Note::generate(
            &mut OsRng,
            sender_address,
            Value {
                amount: 1558827u64.into(),
                asset_id: *STAKING_TOKEN_ASSET_ID,
            },
        ),
        address_index: Default::default(),
        nullifier: Nullifier::try_from(vec![
            75, 12, 37, 160, 207, 93, 129, 238, 230, 254, 29, 227, 107, 97, 138, 12, 172, 130, 138,
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
    mock_db
        .put_with_key(&tables.spendable_notes, "fee_note_2", &fee_note_2)
        .await
        .unwrap();
}

/// Populate database with only alternative fee token.
async fn setup_env_2(mock_db: &MockDb, tables: &Tables) {
    seed_params_in_db(mock_db, tables).await;

    let sender_address = &Address::dummy(&mut OsRng);

    let metadata_in_db_proto = pb::Metadata {
        base: "penumbravalid1hz2hqlgx4w55vkxzv0n3u93czlkvm6zpgftyny2psg3dp8vcygxqd7fedt"
            .to_string(),
        ..Default::default()
    };
    let metadata: Metadata = metadata_in_db_proto.clone().try_into().unwrap();

    let fee_note = SpendableNoteRecord {
        note_commitment: StateCommitment::try_from([0; 32]).unwrap(),
        note: Note::generate(
            &mut OsRng,
            sender_address,
            Value {
                amount: 1u64.into(),
                asset_id: metadata.id(),
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

    let fee_note_2 = SpendableNoteRecord {
        note_commitment: StateCommitment::try_from([0; 32]).unwrap(),
        note: Note::generate(
            &mut OsRng,
            sender_address,
            Value {
                amount: 1558827u64.into(),
                asset_id: metadata.id(),
            },
        ),
        address_index: Default::default(),
        nullifier: Nullifier::try_from(vec![
            75, 12, 37, 160, 207, 93, 129, 238, 230, 254, 29, 227, 107, 97, 138, 12, 172, 130, 138,
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
    mock_db
        .put_with_key(&tables.spendable_notes, "fee_note_2", &fee_note_2)
        .await
        .unwrap();
}

/// Populate database with native staking token and dummy zero-valued notes.
async fn setup_env_3(mock_db: &MockDb, tables: &Tables) {
    seed_params_in_db(mock_db, tables).await;

    let sender_address = &Address::dummy(&mut OsRng);

    let fee_note = SpendableNoteRecord {
        note_commitment: StateCommitment::try_from([0; 32]).unwrap(),
        note: Note::generate(
            &mut OsRng,
            sender_address,
            Value {
                amount: 1u64.into(),
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

    let fee_note_2 = SpendableNoteRecord {
        note_commitment: StateCommitment::try_from([0; 32]).unwrap(),
        note: Note::generate(
            &mut OsRng,
            sender_address,
            Value {
                amount: 1558827u64.into(),
                asset_id: *STAKING_TOKEN_ASSET_ID,
            },
        ),
        address_index: Default::default(),
        nullifier: Nullifier::try_from(vec![
            75, 12, 37, 160, 207, 93, 129, 238, 230, 254, 29, 227, 107, 97, 138, 12, 172, 130, 138,
            66, 123, 217, 253, 148, 178, 91, 112, 125, 247, 32, 189, 2,
        ])
        .unwrap(),
        height_created: 0,
        height_spent: None,
        position: Default::default(),
        source: CommitmentSource::Genesis,
        return_address: None,
    };

    let fee_note_3 = SpendableNoteRecord {
        note_commitment: StateCommitment::try_from([0; 32]).unwrap(),
        note: Note::generate(
            &mut OsRng,
            sender_address,
            Value {
                amount: 0u64.into(),
                asset_id: *STAKING_TOKEN_ASSET_ID,
            },
        ),
        address_index: Default::default(),
        nullifier: Nullifier::try_from(vec![
            78, 12, 37, 160, 207, 93, 129, 238, 230, 254, 29, 227, 107, 97, 138, 12, 172, 130, 138,
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
    mock_db
        .put_with_key(&tables.spendable_notes, "fee_note_2", &fee_note_2)
        .await
        .unwrap();
    mock_db
        .put_with_key(&tables.spendable_notes, "fee_note_3", &fee_note_3)
        .await
        .unwrap();
}

/////////////////////////////////////////////// SPEND AMOUNT VALIDATION ////////////////////////////////////////////////
///                                                                                                                  ///
/// This is the first safety check we have in-place, verifying that the user's request spend amount                  ///
/// is exactly equal to the total accumulated note balance.                                                          ///
///                                                                                                                  ///  
/// (1) "Exact Match": requested spend amount === total accumulated notes, planner is constructed successfully.      ///
/// (2) "Non-Exact Match": requested spend amount !=== total accumulated notes, planner handles the error properly.  ///
///                                                                                                                  ///
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/// Constructs two transaction planner requests: the first sends the entire balance of the native
/// staking token, successfully creating a fully-formed transaction plan; the second attempts a
/// partial spend, resulting in an appropriate error.
#[wasm_bindgen_test]
async fn test_spend_amount_validation_with_native_token() {
    let mock_db = MockDb::new();
    let tables = get_mock_tables();

    setup_env_1(&mock_db, &tables).await;

    let storage = Storage::new(mock_db, tables).unwrap();
    let reciever_address = &Address::dummy(&mut OsRng);

    #[allow(deprecated)]
    let valid_request = TransactionPlannerRequest {
        expiry_height: 0,
        memo: None,
        source: None,
        outputs: vec![],
        spends: vec![Spend {
            address: Some(reciever_address.into()),
            value: Some(
                Value {
                    amount: 1558828u64.into(),
                    asset_id: *STAKING_TOKEN_ASSET_ID,
                }
                .into(),
            ),
        }],
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
        epoch_index: 0,
        epoch: None,
        fee_mode: None,
    };
    let full_viewing_key = FullViewingKey::from_str("penumbrafullviewingkey1mnm04x7yx5tyznswlp0sxs8nsxtgxr9p98dp0msuek8fzxuknuzawjpct8zdevcvm3tsph0wvsuw33x2q42e7sf29q904hwerma8xzgrxsgq2").unwrap();

    let fee_id = *STAKING_TOKEN_ASSET_ID;

    let valid_response = plan_transaction_inner(
        storage.clone(),
        valid_request,
        full_viewing_key.clone(),
        fee_id,
    )
    .await
    .unwrap();

    assert_eq!(valid_response.actions.len(), 3);

    #[allow(deprecated)]
    let invalid_request = TransactionPlannerRequest {
        expiry_height: 0,
        memo: None,
        source: None,
        outputs: vec![],
        spends: vec![Spend {
            address: Some(reciever_address.into()),
            value: Some(
                Value {
                    amount: 1u64.into(),
                    asset_id: fee_id,
                }
                .into(),
            ),
        }],
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
        epoch_index: 0,
        epoch: None,
        fee_mode: None,
    };

    let invalid_response =
        plan_transaction_inner(storage, invalid_request, full_viewing_key, fee_id).await;

    match invalid_response {
        Ok(_) => panic!(),
        Err(e) => {
            if let WasmError::Anyhow(err) = e {
                let error_message = err.to_string();
                assert!(error_message
                    .contains("Invalid transaction: The transaction was constructed improperly."));
            }
        }
    }
}

/// Constructs two transaction planner requests: the first sends the entire balance of an alternative
/// fee token, successfully creating a fully-formed transaction plan; the second attempts a partial
/// spend, resulting in an appropriate error.
#[wasm_bindgen_test]
async fn test_spend_amount_validation_with_alternative_token() {
    let mock_db = MockDb::new();
    let tables = get_mock_tables();

    setup_env_2(&mock_db, &tables).await;

    let storage = Storage::new(mock_db.clone(), tables.clone()).unwrap();
    let reciever_address = &Address::dummy(&mut OsRng);

    let metadata_in_db_proto = pb::Metadata {
        base: "penumbravalid1hz2hqlgx4w55vkxzv0n3u93czlkvm6zpgftyny2psg3dp8vcygxqd7fedt"
            .to_string(),
        ..Default::default()
    };
    let metadata: Metadata = metadata_in_db_proto.clone().try_into().unwrap();

    let fee_id = metadata.id();

    let gas_prices = GasPrices {
        asset_id: fee_id,
        block_space_price: 100,
        compact_block_space_price: 2000,
        verification_price: 150,
        execution_price: 300,
    };
    mock_db
        .put_with_key(
            &tables.gas_prices,
            byte_array_to_base64(&fee_id.to_proto().inner),
            &gas_prices,
        )
        .await
        .unwrap();

    #[allow(deprecated)]
    let valid_request = TransactionPlannerRequest {
        expiry_height: 0,
        memo: None,
        source: None,
        outputs: vec![],
        spends: vec![Spend {
            address: Some(reciever_address.into()),
            value: Some(
                Value {
                    amount: 1558828u64.into(),
                    asset_id: fee_id,
                }
                .into(),
            ),
        }],
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
        epoch_index: 0,
        epoch: None,
        fee_mode: None,
    };

    let full_viewing_key = FullViewingKey::from_str("penumbrafullviewingkey1mnm04x7yx5tyznswlp0sxs8nsxtgxr9p98dp0msuek8fzxuknuzawjpct8zdevcvm3tsph0wvsuw33x2q42e7sf29q904hwerma8xzgrxsgq2").unwrap();

    let valid_response = plan_transaction_inner(
        storage.clone(),
        valid_request,
        full_viewing_key.clone(),
        fee_id,
    )
    .await
    .unwrap();

    assert_eq!(valid_response.actions.len(), 3);

    #[allow(deprecated)]
    let invalid_request = TransactionPlannerRequest {
        expiry_height: 0,
        memo: None,
        source: None,
        outputs: vec![],
        spends: vec![Spend {
            address: Some(reciever_address.into()),
            value: Some(
                Value {
                    amount: 1u64.into(),
                    asset_id: metadata.id(),
                }
                .into(),
            ),
        }],
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
        epoch_index: 0,
        epoch: None,
        fee_mode: None,
    };

    let invalid_response =
        plan_transaction_inner(storage, invalid_request, full_viewing_key, fee_id).await;

    match invalid_response {
        Ok(_) => panic!(),
        Err(e) => {
            if let WasmError::Anyhow(err) = e {
                let error_message = err.to_string();
                assert!(error_message
                    .contains("Invalid transaction: The transaction was constructed improperly."));
            }
        }
    }
}

/////////////////////////////////////////////// ASSET ID VALIDATION /////////////////////////////////////////////////////
///                                                                                                                   ///
/// This sanity checks the second safety check we have in-place, verifying that each spend action's asset ID          ///
/// matches the fee asset ID.                                                                                         ///
///                                                                                                                   ///
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/// Constructs two transaction planner requests: the first, where the asset ID matches the fee asset ID,
/// successfully creates a fully-formed transaction plan; the second, where the asset ID does not match
/// the fee asset ID, results in an appropriate error.
#[wasm_bindgen_test]
async fn test_fee_asset_id_validation() {
    let mock_db = MockDb::new();
    let tables = get_mock_tables();

    setup_env_1(&mock_db, &tables).await;

    let storage = Storage::new(mock_db.clone(), tables.clone()).unwrap();
    let reciever_address = &Address::dummy(&mut OsRng);

    let metadata_in_db_proto = pb::Metadata {
        base: "penumbravalid1hz2hqlgx4w55vkxzv0n3u93czlkvm6zpgftyny2psg3dp8vcygxqd7fedt"
            .to_string(),
        ..Default::default()
    };
    let metadata: Metadata = metadata_in_db_proto.clone().try_into().unwrap();

    let fee_id = metadata.id();

    let gas_prices = GasPrices {
        asset_id: fee_id,
        block_space_price: 100,
        compact_block_space_price: 2000,
        verification_price: 150,
        execution_price: 300,
    };

    mock_db
        .put_with_key(
            &tables.gas_prices,
            byte_array_to_base64(&fee_id.to_proto().inner),
            &gas_prices,
        )
        .await
        .unwrap();

    #[allow(deprecated)]
    let invalid_request = TransactionPlannerRequest {
        expiry_height: 0,
        memo: None,
        source: None,
        outputs: vec![],
        spends: vec![Spend {
            address: Some(reciever_address.into()),
            value: Some(
                Value {
                    amount: 1558828u64.into(),
                    asset_id: *STAKING_TOKEN_ASSET_ID,
                }
                .into(),
            ),
        }],
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
        epoch_index: 0,
        epoch: None,
        fee_mode: None,
    };
    let full_viewing_key = FullViewingKey::from_str("penumbrafullviewingkey1mnm04x7yx5tyznswlp0sxs8nsxtgxr9p98dp0msuek8fzxuknuzawjpct8zdevcvm3tsph0wvsuw33x2q42e7sf29q904hwerma8xzgrxsgq2").unwrap();

    let invalid_response = plan_transaction_inner(
        storage.clone(),
        invalid_request,
        full_viewing_key.clone(),
        fee_id,
    )
    .await;

    match invalid_response {
        Ok(_) => panic!(),
        Err(e) => {
            if let WasmError::Anyhow(err) = e {
                let error_message = err.to_string();
                assert!(error_message
                    .contains("Invalid transaction: The transaction was constructed improperly."));
            }
        }
    }
}

/////////////////////////////////////////////// FILTER ZERO-VALUED NOTES VALIDATION ////////////////////////////////////
///                                                                                                                  ///
/// This ensures that zero-valued notes are correctly filtered out of the spendable note record (SNR) set.           ///
/// It also checks the planner's behavior when no spendable notes are available.                                     ///
///                                                                                                                  ///
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

#[wasm_bindgen_test]
async fn test_filter_zero_value_notes() {
    let mock_db = MockDb::new();
    let tables = get_mock_tables();

    setup_env_3(&mock_db, &tables).await;

    let storage = Storage::new(mock_db.clone(), tables.clone()).unwrap();
    let reciever_address = &Address::dummy(&mut OsRng);

    let fee_id = *STAKING_TOKEN_ASSET_ID;

    #[allow(deprecated)]
    let req = TransactionPlannerRequest {
        expiry_height: 0,
        memo: None,
        source: None,
        outputs: vec![],
        spends: vec![Spend {
            address: Some(reciever_address.into()),
            value: Some(
                Value {
                    amount: 1558828u64.into(),
                    asset_id: fee_id,
                }
                .into(),
            ),
        }],
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
        epoch_index: 0,
        epoch: None,
        fee_mode: None,
    };
    let full_viewing_key = FullViewingKey::from_str("penumbrafullviewingkey1mnm04x7yx5tyznswlp0sxs8nsxtgxr9p98dp0msuek8fzxuknuzawjpct8zdevcvm3tsph0wvsuw33x2q42e7sf29q904hwerma8xzgrxsgq2").unwrap();

    let res = plan_transaction_inner(storage.clone(), req, full_viewing_key.clone(), fee_id)
        .await
        .unwrap();

    assert_eq!(res.actions.len(), 3);
}

#[wasm_bindgen_test]
async fn test_empty_note_set() {
    let mock_db = MockDb::new();
    let tables = get_mock_tables();

    seed_params_in_db(&mock_db, &tables).await;

    let storage = Storage::new(mock_db.clone(), tables.clone()).unwrap();
    let reciever_address = &Address::dummy(&mut OsRng);

    let fee_id = *STAKING_TOKEN_ASSET_ID;

    #[allow(deprecated)]
    let req = TransactionPlannerRequest {
        expiry_height: 0,
        memo: None,
        source: None,
        outputs: vec![],
        spends: vec![Spend {
            address: Some(reciever_address.into()),
            value: Some(
                Value {
                    amount: 1558828u64.into(),
                    asset_id: fee_id,
                }
                .into(),
            ),
        }],
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
        epoch_index: 0,
        epoch: None,
        fee_mode: None,
    };
    let full_viewing_key = FullViewingKey::from_str("penumbrafullviewingkey1mnm04x7yx5tyznswlp0sxs8nsxtgxr9p98dp0msuek8fzxuknuzawjpct8zdevcvm3tsph0wvsuw33x2q42e7sf29q904hwerma8xzgrxsgq2").unwrap();

    let res = plan_transaction_inner(storage.clone(), req, full_viewing_key.clone(), fee_id).await;

    match res {
        Ok(_) => panic!(),
        Err(e) => {
            if let WasmError::Anyhow(err) = e {
                let error_message = err.to_string();
                assert!(error_message
                    .contains("Invalid transaction: The transaction was constructed improperly."));
            }
        }
    }
}
