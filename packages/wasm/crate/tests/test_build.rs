extern crate penumbra_wasm;
use penumbra_asset::STAKING_TOKEN_ASSET_ID;
use penumbra_dex::DexParameters;
use penumbra_keys::keys::SpendKey;
use penumbra_keys::FullViewingKey;
use penumbra_proto::core::app::v1::AppParameters;
use penumbra_proto::core::component::fee::v1::GasPrices;
use penumbra_proto::view::v1::transaction_planner_request::Output;
use penumbra_proto::view::v1::TransactionPlannerRequest;
use penumbra_proto::{
    core::{asset::v1::Value, keys::v1::Address, transaction::v1::MemoPlaintext},
    view::v1::SpendableNoteRecord,
    DomainType,
};
use penumbra_sct::params::SctParameters;
use penumbra_shielded_pool::fmd::Parameters;
use penumbra_tct::structure::Hash;
use penumbra_tct::Forgotten;
use penumbra_transaction::{Action, ActionPlan, AuthorizationData, WitnessData};
use penumbra_wasm::build::{build_action_inner, build_parallel_inner, build_serial_inner};
use penumbra_wasm::database::interface::Database;
use penumbra_wasm::database::mock::{get_mock_tables, MockDb};
use penumbra_wasm::planner::plan_transaction_inner;
use penumbra_wasm::storage::{byte_array_to_base64, Storage};
use penumbra_wasm::{
    keys::load_proving_key,
    tx::{authorize, witness},
};
use serde::{Deserialize, Serialize};
use std::str::FromStr;
use wasm_bindgen_test::*;

wasm_bindgen_test::wasm_bindgen_test_configure!(run_in_browser);
#[wasm_bindgen_test]
async fn mock_build_serial_and_parallel() {
    // Load the proving key parameters as byte arrays.
    let spend_key: &[u8] = include_bytes!("../../../keys/keys/spend_pk.bin");
    let output_key: &[u8] = include_bytes!("../../../keys/keys/output_pk.bin");
    let delegator_vote_key: &[u8] = include_bytes!("../../../keys/keys/delegator_vote_pk.bin");
    let swap_key: &[u8] = include_bytes!("../../../keys/keys/swap_pk.bin");
    let swapclaim_key: &[u8] = include_bytes!("../../../keys/keys/swapclaim_pk.bin");
    let convert_key: &[u8] = include_bytes!("../../../keys/keys/convert_pk.bin");

    // Dynamically load the proving keys at runtime for each key type.
    load_proving_key(spend_key, "spend").expect("can load spend key");
    load_proving_key(output_key, "output").expect("can load output key");
    load_proving_key(delegator_vote_key, "delegatorVote").expect("can load delegator vote key");
    load_proving_key(swap_key, "swap").expect("can load swap key");
    load_proving_key(swapclaim_key, "swapClaim").expect("can load swapclaim key");
    load_proving_key(convert_key, "undelegateClaim").expect("can load convert key");

    // MockDb
    let mock_db = MockDb::new();
    let tables = get_mock_tables();

    // Define SCT-related structs.
    #[derive(Clone, Debug, Serialize, Deserialize)]
    pub struct Position {
        pub epoch: u64,
        pub block: u64,
        pub commitment: u64,
    }

    #[derive(Clone, Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct StoredPosition {
        pub Position: Position,
    }

    #[derive(Clone, Debug, Serialize, Deserialize)]
    pub struct StoreHash {
        pub position: Position,
        pub height: u64,
        pub hash: Hash,
        pub essential: bool,
    }

    #[derive(Clone, Debug, Serialize, Deserialize)]
    pub struct StoreCommitment {
        pub commitment: Commitment,
        pub position: Position,
    }

    #[derive(Clone, Debug, Serialize, Deserialize)]
    pub struct Commitment {
        pub inner: String,
    }

    #[derive(Clone, Debug, Serialize, Deserialize)]
    pub struct StateCommitmentTree {
        pub last_position: Position,
        pub last_forgotten: u64,
        pub hashes: StoreHash,
        pub commitments: StoreCommitment,
    }

    #[derive(Clone, Debug, Serialize, Deserialize)]
    pub struct SctUpdates {
        pub store_commitments: StoreCommitment,
        pub set_position: StoredPosition,
        pub set_forgotten: u64,
    }

    #[derive(Clone, Debug, Serialize, Deserialize)]
    pub struct StoredTree {
        pub last_position: Option<StoredPosition>,
        pub last_forgotten: Option<Forgotten>,
        pub hashes: Vec<StoreHash>,
        pub commitments: Vec<StoreCommitment>,
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

    // Create spendable UTXO note in JSON format.
    let spendable_note_json = r#"
    {
        "note_commitment": {
            "inner": "MY7PmcrH4fhjFOoMIKEdF+x9EUhZ9CS/CIfVco7Y5wU="
        },
        "note": {
            "value": {
                "amount": {
                    "lo": "1000000",
                    "hi": "0"
                },
                "asset_id": {
                    "inner": "nwPDkQq3OvLnBwGTD+nmv1Ifb2GEmFCgNHrU++9BsRE=",
                    "alt_bech32m": "",
                    "alt_base_denom": ""
                }
            },
            "rseed": "p2w4O1ognDJtKVqhHK2qsUbV+1AEM/gn58uWYQ5v3sM=",
            "address": {
                "inner": "F6T1P51M1QOu8NGhKTMdJTy72TDhB2h00uvlIUcXVdovybq4ZcOwROB+1VE/ar4thEDNPanAcaYOrL+FugN8e19pvr93ZqmTjUdOLic+w+U=",
                "alt_bech32m": ""
            }
        },
        "address_index": {
            "account": "0",
            "randomizer": "AAAAAAAAAAAAAAAA"
        },
        "nullifier": {
            "inner": "8TvyFVKk16PHcOEAgl0QV4/92xdVpLdXI+zP87lBrQ8="
        },
        "height_created": "250305",
        "height_spent": "0",
        "position": "3204061134848",
        "source": {
            "transaction": {
                "id": "oJ9Bo9v22srtUmKdTAMVwPOuGumWE2cAuBbZHci8B1I="
            }
        }
    }
    "#;

    // Convert note to `SpendableNoteRecord`.
    let spendable_note: SpendableNoteRecord =
        serde_json::from_str(spendable_note_json).expect("Failed to deserialize spendable note");

    // Define neccessary parameters to mock `TransactionPlannerRequest` in JSON format.
    let address_json = r#"
    {
        "alt_bech32m": "penumbra1dugkjttfezh4gfkqs77377gnjlvmkkehusx6953udxeescc0qpgk6gqc0jmrsjq8xphzrg938843p0e63z09vt8lzzmef0q330e5njuwh4290n8pemcmx70sasym0lcjkstgzc",
        "inner": ""
    }
    "#;
    let value_json = r#"
    {
        "amount": {
            "lo": "1",
            "hi": "0"
        },
        "asset_id": {
            "inner": "nwPDkQq3OvLnBwGTD+nmv1Ifb2GEmFCgNHrU++9BsRE=",
            "alt_bech32m": "",
            "alt_base_denom": ""
        }
    }
    "#;

    // Convert fields to JsValue.
    let address: Address = serde_json::from_str(address_json).unwrap();
    let value: Value = serde_json::from_str(value_json).unwrap();

    // Add memo to plan.
    let memo: MemoPlaintext = MemoPlaintext {
        return_address: Some(address.clone()),
        text: "sample memo".to_string(),
    };

    // Define a sample SCT update.
    #[allow(non_snake_case)]
    let sctUpdates = SctUpdates {
        store_commitments: StoreCommitment {
            commitment: Commitment {
                inner: "MY7PmcrH4fhjFOoMIKEdF+x9EUhZ9CS/CIfVco7Y5wU=".to_string(),
            },
            position: Position {
                epoch: 746u64,
                block: 237u64,
                commitment: 0u64,
            },
        },
        set_position: StoredPosition {
            Position: Position {
                epoch: 750u64,
                block: 710u64,
                commitment: 0u64,
            },
        },
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
            address: Some(address),
            value: Some(value),
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

    let plan_slice = &*transaction_plan.clone().encode_to_vec();

    // 2. Generate authorization data from spend key and transaction plan.

    let spend_key = SpendKey::from_str(
        "penumbraspendkey1qul0huewkcmemljd5m3vz3awqt7442tjg2dudahvzu6eyj9qf0eszrnguh",
    )
    .unwrap();

    let authorization_data_bytes: Vec<u8> =
        authorize(spend_key.encode_to_vec().as_slice(), plan_slice).unwrap();
    let authorization_data = AuthorizationData::decode(&*authorization_data_bytes).unwrap();

    // 3. Generate witness.

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

    // Convert SCT to `JsValue`.
    let sct_json = serde_wasm_bindgen::to_value(&sct).unwrap();

    // Generate witness data from SCT and specific transaction plan.
    let witness_data_bytes: Vec<u8> = witness(plan_slice, sct_json).unwrap();
    let witness_data: WitnessData = WitnessData::decode(&*witness_data_bytes).unwrap();

    // 4. Build the serial and parallel transactions

    let mut actions: Vec<Action> = Vec::new();
    for i in transaction_plan.clone().actions.clone() {
        if let ActionPlan::Spend(ref _spend_plan) = i {
            let action = build_action_inner(
                transaction_plan.clone(),
                i.clone(),
                full_viewing_key.clone(),
                witness_data.clone(),
            )
            .unwrap();
            actions.push(action);
        }
        if let ActionPlan::Output(ref _output_plan) = i {
            let action = build_action_inner(
                transaction_plan.clone(),
                i,
                full_viewing_key.clone(),
                witness_data.clone(),
            )
            .unwrap();
            actions.push(action);
        }
    }

    // Execute parallel spend transaction and generate proof.
    let parallel_transaction = build_parallel_inner(
        actions,
        transaction_plan.clone(),
        witness_data.clone(),
        authorization_data.clone(),
    )
    .unwrap();
    console_log!("Parallel transaction is: {:?}", parallel_transaction);

    // Execute serial spend transaction and generate proof.
    let serial_transaction = build_serial_inner(
        full_viewing_key,
        transaction_plan,
        witness_data,
        authorization_data,
    )
    .unwrap();
    console_log!("Serial transaction is: {:?}", serial_transaction);

    // Deserialize transactions and stringify actions in the transaction body into JSON
    let serial_json = serde_json::to_string(&serial_transaction.transaction_body.actions).unwrap();
    let parallel_json =
        serde_json::to_string(&parallel_transaction.transaction_body.actions).unwrap();

    // Perform assertion check
    assert_eq!(serial_json, parallel_json);
}
