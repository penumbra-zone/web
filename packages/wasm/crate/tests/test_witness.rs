use penumbra_asset::{Value, STAKING_TOKEN_ASSET_ID};
use penumbra_dex::DexParameters;
use penumbra_keys::Address;
use penumbra_keys::FullViewingKey;
use penumbra_proto::core::app::v1::AppParameters;
use penumbra_proto::core::component::fee::v1::GasPrices;
use penumbra_proto::core::transaction::v1::MemoPlaintext;
use penumbra_proto::view::v1::transaction_planner_request::Output;
use penumbra_proto::view::v1::TransactionPlannerRequest;
use penumbra_proto::DomainType;
use penumbra_sct::params::SctParameters;
use penumbra_sct::{CommitmentSource, Nullifier};
use penumbra_shielded_pool::fmd::Parameters;
use penumbra_shielded_pool::Note;
use penumbra_tct::storage::StoreCommitment;
use penumbra_tct::storage::StoredPosition;
use penumbra_tct::Forgotten;
use penumbra_tct::Position;
use penumbra_tct::StateCommitment;
use penumbra_wasm::database::interface::Database;
use penumbra_wasm::database::mock::{get_mock_tables, MockDb};
use penumbra_wasm::note_record::SpendableNoteRecord;
use penumbra_wasm::planner::plan_transaction_inner;
use penumbra_wasm::storage::{byte_array_to_base64, Storage};
use penumbra_wasm::tx::witness_inner;
use penumbra_wasm::view_server::StoredTree;
use rand_core::OsRng;
use serde::Deserialize;
use serde::Serialize;
use std::str::FromStr;

use wasm_bindgen_test::wasm_bindgen_test;
use wasm_bindgen_test::*;
wasm_bindgen_test::wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
async fn test_witness() {
    // MockDb
    let mock_db = MockDb::new();
    let tables = get_mock_tables();

    // Define SCT-related structs.
    #[derive(Clone, Debug, Serialize, Deserialize)]
    pub struct SctUpdates {
        pub store_commitments: StoreCommitment,
        pub set_position: StoredPosition,
        pub set_forgotten: u64,
    }

    // Sample chain and fmd parameters.
    let app_params = AppParameters {
        dex_params: Some(
            DexParameters {
                fixed_candidates: Vec::new(),
                is_enabled: true,
                max_hops: 5u32,
                max_positions_per_pair: 0,
                max_execution_budget: 0u32,
            }
            .to_proto(),
        ),
        chain_id: "penumbra-testnet-iapetus".to_string(),
        sct_params: Some(
            SctParameters {
                epoch_duration: 5u64,
            }
            .to_proto(),
        ),
        community_pool_params: None,
        governance_params: None,
        ibc_params: None,
        stake_params: None,
        fee_params: None,
        distributions_params: None,
        funding_params: None,
        shielded_pool_params: None,
        auction_params: None,
    };

    let fmd_params = Parameters {
        precision: Default::default(),
        as_of_block_height: 0,
    };

    let gas_prices = GasPrices {
        asset_id: Some((*STAKING_TOKEN_ASSET_ID).into()),
        block_space_price: 0,
        compact_block_space_price: 0,
        verification_price: 0,
        execution_price: 0,
    };

    let address = &Address::dummy(&mut OsRng);

    let spendable_note = SpendableNoteRecord {
        note_commitment: StateCommitment::try_from([1; 32]).unwrap(),
        note: Note::generate(
            &mut OsRng,
            address,
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

    // Add memo to plan.
    let memo: MemoPlaintext = MemoPlaintext {
        return_address: Some(address.clone().into()),
        text: "sample memo".to_string(),
    };

    // Define a sample SCT update.
    #[allow(non_snake_case)]
    let sctUpdates = SctUpdates {
        store_commitments: StoreCommitment {
            commitment: StateCommitment::try_from([1; 32]).unwrap(),
            position: Position::default(),
        },
        set_position: StoredPosition::Position(Position::default()),
        set_forgotten: 3u64,
    };

    // Populate MockDB
    mock_db
        .put_with_key(&tables.spendable_notes, "spendable_note", &spendable_note)
        .await
        .unwrap();

    mock_db
        .put_with_key(
            &tables.tree_commitments,
            "tree_commitments",
            &sctUpdates.store_commitments,
        )
        .await
        .unwrap();

    mock_db
        .put_with_key(
            &tables.tree_last_position,
            "last_position",
            &sctUpdates.set_position,
        )
        .await
        .unwrap();

    mock_db
        .put_with_key(
            &tables.tree_last_forgotten,
            "last_forgotten",
            &sctUpdates.set_forgotten,
        )
        .await
        .unwrap();

    mock_db
        .put_with_key(&tables.fmd_parameters, "params", &fmd_params)
        .await
        .unwrap();

    mock_db
        .put_with_key(&tables.clone().app_parameters, "params", &app_params)
        .await
        .unwrap();

    mock_db
        .put_with_key(
            &tables.clone().gas_prices,
            byte_array_to_base64(&STAKING_TOKEN_ASSET_ID.to_proto().inner),
            &gas_prices,
        )
        .await
        .unwrap();

    // Instantiate storage object
    let storage: Storage<MockDb> = Storage::new(mock_db.clone(), tables.clone()).unwrap();

    // 1. Query transaction plan performing a spend.

    #[allow(deprecated)] // Remove if/when `epoch_index` is removed
    let planner_request = TransactionPlannerRequest {
        epoch: None,
        epoch_index: 0,
        expiry_height: 0,
        memo: Some(memo),
        source: None,
        outputs: vec![Output {
            address: Some(address.into()),
            value: Some(
                Value {
                    amount: 1u64.into(),
                    asset_id: *STAKING_TOKEN_ASSET_ID,
                }
                .into(),
            ),
        }],
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
        fee_mode: None,
        dutch_auction_schedule_actions: vec![],
        dutch_auction_end_actions: vec![],
        dutch_auction_withdraw_actions: vec![],
        delegator_votes: vec![],
    };

    // Viewing key to reveal asset balances and transactions.
    let full_viewing_key = FullViewingKey::from_str("penumbrafullviewingkey1mnm04x7yx5tyznswlp0sxs8nsxtgxr9p98dp0msuek8fzxuknuzawjpct8zdevcvm3tsph0wvsuw33x2q42e7sf29q904hwerma8xzgrxsgq2").unwrap();

    let transaction_plan = plan_transaction_inner(
        storage.clone(),
        planner_request,
        full_viewing_key.clone(),
        *STAKING_TOKEN_ASSET_ID,
    )
    .await
    .unwrap();

    // 2. Generate witness.

    // Retrieve SCT from storage.
    let tx_last_position: StoredPosition = mock_db
        .get(&tables.tree_last_position, "last_position")
        .await
        .unwrap()
        .unwrap();
    let tx_last_forgotten: Forgotten = mock_db
        .get(&tables.tree_last_forgotten, "last_forgotten")
        .await
        .unwrap()
        .unwrap();
    let tx_tree_commitments: StoreCommitment = mock_db
        .get(&tables.tree_commitments, "tree_commitments")
        .await
        .unwrap()
        .unwrap();

    // Reconstruct SCT struct.
    let vec_store_commitments: Vec<StoreCommitment> = vec![tx_tree_commitments.clone()];
    let sct = StoredTree {
        last_position: Some(tx_last_position.clone()),
        last_forgotten: Some(tx_last_forgotten),
        hashes: [].to_vec(),
        commitments: vec_store_commitments,
    };

    // Generate witness data from SCT and specific transaction plan.
    let witness_data = witness_inner(transaction_plan, sct).unwrap();
    console_log!("witness_data: {:?}", witness_data);
}
