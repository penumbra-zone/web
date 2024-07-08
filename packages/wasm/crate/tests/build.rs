extern crate penumbra_wasm;

#[cfg(test)]
mod tests {
    use std::str::FromStr;

    use indexed_db_futures::prelude::{
        IdbDatabase, IdbObjectStore, IdbQuerySource, IdbTransaction, IdbTransactionMode,
    };
    use penumbra_asset::STAKING_TOKEN_ASSET_ID;
    use penumbra_dex::DexParameters;
    use penumbra_keys::keys::SpendKey;
    use penumbra_keys::FullViewingKey;
    use penumbra_proto::core::app::v1::AppParameters;
    use penumbra_proto::core::component::fee::v1::GasPrices;
    use penumbra_proto::core::transaction::v1;
    use penumbra_proto::view::v1::transaction_planner_request::Output;
    use penumbra_proto::view::v1::TransactionPlannerRequest;
    use penumbra_proto::{
        core::{
            asset::v1::Value, component::shielded_pool::v1::FmdParameters, keys::v1::Address,
            transaction::v1::MemoPlaintext,
        },
        view::v1::SpendableNoteRecord,
        DomainType,
    };
    use penumbra_sct::params::SctParameters;
    use penumbra_tct::{structure::Hash, Forgotten};
    use penumbra_transaction::{
        plan::{ActionPlan, TransactionPlan},
        Action, Transaction,
    };
    use prost::Message;
    use serde::{Deserialize, Serialize};
    use wasm_bindgen::JsValue;
    use wasm_bindgen_test::*;

    use penumbra_wasm::planner::plan_transaction;
    use penumbra_wasm::storage::byte_array_to_base64;
    use penumbra_wasm::{
        build::build_action,
        keys::load_proving_key,
        storage::IndexedDBStorage,
        tx::{authorize, build, build_parallel, witness},
    };

    wasm_bindgen_test::wasm_bindgen_test_configure!(run_in_browser);
    #[wasm_bindgen_test]
    async fn mock_build_serial_and_parallel() {
        // Limit the use of Penumbra Rust libraries since we're mocking JS calls
        // that are based on constructing objects according to protobuf definitions.

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

        // Define database parameters.
        #[derive(Clone, Debug, Serialize, Deserialize)]
        pub struct IndexedDbConstants {
            name: String,
            version: u32,
            tables: Tables,
        }

        #[derive(Clone, Debug, Serialize, Deserialize)]
        pub struct Tables {
            assets: String,
            advice_notes: String,
            spendable_notes: String,
            swaps: String,
            fmd_parameters: String,
            app_parameters: String,
            gas_prices: String,
            epochs: String,
            transactions: String,
            full_sync_height: String,
            auctions: String,
            auction_outstanding_reserves: String,
        }

        // Define `IndexDB` table parameters and constants.
        let tables: Tables = Tables {
            assets: "ASSETS".to_string(),
            advice_notes: "ADVICE_NOTES".to_string(),
            spendable_notes: "SPENDABLE_NOTES".to_string(),
            swaps: "SWAPS".to_string(),
            fmd_parameters: "FMD_PARAMETERS".to_string(),
            app_parameters: "APP_PARAMETERS".to_string(),
            gas_prices: "GAS_PRICES".to_string(),
            epochs: "EPOCHS".to_string(),
            transactions: "TRANSACTIONS".to_string(),
            full_sync_height: "FULL_SYNC_HEIGHT".to_string(),
            auctions: "AUCTIONS".to_string(),
            auction_outstanding_reserves: "AUCTION_OUTSTANDING_RESERVES".to_string(),
        };

        let constants: IndexedDbConstants = IndexedDbConstants {
            name: "penumbra-db-wasm-test".to_string(),
            version: 1,
            tables,
        };

        // Sample chain and fmd parameters.
        let chain_id = "penumbra-testnet-iapetus".to_string();
        let sct_params = SctParameters {
            epoch_duration: 5u64,
        };
        let dex_params = DexParameters {
            fixed_candidates: Vec::new(),
            is_enabled: true,
            max_hops: 5u32,
            max_positions_per_pair: 0,
            max_execution_budget: 0u32,
        };

        let app_params = AppParameters {
            dex_params: Some(dex_params.to_proto()),
            chain_id,
            sct_params: Some(sct_params.to_proto()),
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

        let fmd_params = FmdParameters {
            precision_bits: 0u32,
            as_of_block_height: 1u64,
        };
        let gas_prices = GasPrices {
            asset_id: Some((*STAKING_TOKEN_ASSET_ID).into()),
            block_space_price: 0,
            compact_block_space_price: 0,
            verification_price: 0,
            execution_price: 0,
        };

        // Serialize the parameters into `JsValue`.
        let js_app_params_value: JsValue = serde_wasm_bindgen::to_value(&app_params).unwrap();
        let js_fmd_params_value: JsValue = serde_wasm_bindgen::to_value(&fmd_params).unwrap();
        let js_constants_params_value: JsValue = serde_wasm_bindgen::to_value(&constants).unwrap();
        let js_gas_prices_value: JsValue = serde_wasm_bindgen::to_value(&gas_prices).unwrap();

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
            serde_json::from_str(spendable_note_json).unwrap();

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

        // Retrieve private database handle with public getters.
        let storage = IndexedDBStorage::new(
            serde_wasm_bindgen::from_value(js_constants_params_value.clone()).unwrap(),
        )
        .await
        .unwrap();
        // let storage_ref: &IndexedDBStorage = unsafe { &*storage };
        let database: *const IdbDatabase = storage.get_database();
        let database_ref: &IdbDatabase = unsafe { &*database };

        // Define SCT-related structs.
        #[derive(Clone, Debug, Serialize, Deserialize)]
        pub struct Position {
            epoch: u64,
            block: u64,
            commitment: u64,
        }

        #[derive(Clone, Debug, Serialize, Deserialize)]
        #[allow(non_snake_case)]
        pub struct StoredPosition {
            Position: Position,
        }

        #[derive(Clone, Debug, Serialize, Deserialize)]
        pub struct StoreHash {
            position: Position,
            height: u64,
            hash: Hash,
            essential: bool,
        }

        #[derive(Clone, Debug, Serialize, Deserialize)]
        pub struct StoreCommitment {
            commitment: Commitment,
            position: Position,
        }

        #[derive(Clone, Debug, Serialize, Deserialize)]
        pub struct Commitment {
            inner: String,
        }

        #[derive(Clone, Debug, Serialize, Deserialize)]
        pub struct StateCommitmentTree {
            last_position: Position,
            last_forgotten: u64,
            hashes: StoreHash,
            commitments: StoreCommitment,
        }

        #[derive(Clone, Debug, Serialize, Deserialize)]
        pub struct SctUpdates {
            store_commitments: StoreCommitment,
            set_position: StoredPosition,
            set_forgotten: u64,
        }

        #[derive(Clone, Debug, Serialize, Deserialize)]
        pub struct StoredTree {
            last_position: Option<StoredPosition>,
            last_forgotten: Option<Forgotten>,
            hashes: Vec<StoreHash>,
            commitments: Vec<StoreCommitment>,
        }

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

        // Populate database with records (CRUD).
        let tx_note: IdbTransaction = database_ref
            .transaction_on_one_with_mode("SPENDABLE_NOTES", IdbTransactionMode::Readwrite)
            .unwrap();
        let tx_tree_commitments: IdbTransaction = database_ref
            .transaction_on_one_with_mode("TREE_COMMITMENTS", IdbTransactionMode::Readwrite)
            .unwrap();
        let tx_tree_last_position: IdbTransaction = database_ref
            .transaction_on_one_with_mode("TREE_LAST_POSITION", IdbTransactionMode::Readwrite)
            .unwrap();
        let tx_tree_last_forgotten: IdbTransaction = database_ref
            .transaction_on_one_with_mode("TREE_LAST_FORGOTTEN", IdbTransactionMode::Readwrite)
            .unwrap();
        let tx_fmd: IdbTransaction = database_ref
            .transaction_on_one_with_mode("FMD_PARAMETERS", IdbTransactionMode::Readwrite)
            .unwrap();
        let tx_app: IdbTransaction = database_ref
            .transaction_on_one_with_mode("APP_PARAMETERS", IdbTransactionMode::Readwrite)
            .unwrap();
        let tx_gas: IdbTransaction = database_ref
            .transaction_on_one_with_mode("GAS_PRICES", IdbTransactionMode::Readwrite)
            .unwrap();

        let store_note: IdbObjectStore = tx_note.object_store("SPENDABLE_NOTES").unwrap();
        let store_tree_commitments: IdbObjectStore = tx_tree_commitments
            .object_store("TREE_COMMITMENTS")
            .unwrap();
        let store_tree_last_position: IdbObjectStore = tx_tree_last_position
            .object_store("TREE_LAST_POSITION")
            .unwrap();
        let store_tree_last_forgotten: IdbObjectStore = tx_tree_last_forgotten
            .object_store("TREE_LAST_FORGOTTEN")
            .unwrap();
        let store_fmd: IdbObjectStore = tx_fmd.object_store("FMD_PARAMETERS").unwrap();
        let store_app: IdbObjectStore = tx_app.object_store("APP_PARAMETERS").unwrap();
        let store_gas: IdbObjectStore = tx_gas.object_store("GAS_PRICES").unwrap();

        let spendable_note_json = serde_wasm_bindgen::to_value(&spendable_note).unwrap();
        let tree_commitments_json =
            serde_wasm_bindgen::to_value(&sctUpdates.store_commitments).unwrap();
        let tree_position_json_value =
            serde_wasm_bindgen::to_value(&sctUpdates.set_position).unwrap();
        let tree_position_json_key = serde_wasm_bindgen::to_value(&"last_position").unwrap();
        let tree_last_forgotten_json_value =
            serde_wasm_bindgen::to_value(&sctUpdates.set_forgotten).unwrap();
        let tree_last_forgotten_json_key: JsValue =
            serde_wasm_bindgen::to_value(&"last_forgotten").unwrap();
        let fmd_json_key: JsValue = serde_wasm_bindgen::to_value(&"params").unwrap();
        let app_json_key: JsValue = serde_wasm_bindgen::to_value(&"params").unwrap();
        let gas_json_key: JsValue = JsValue::from_str(&byte_array_to_base64(
            &STAKING_TOKEN_ASSET_ID.to_proto().inner,
        ));

        store_note.put_val(&spendable_note_json).unwrap();
        store_tree_commitments
            .put_val(&tree_commitments_json)
            .unwrap();
        store_tree_last_position
            .put_key_val(&tree_position_json_key, &tree_position_json_value)
            .unwrap();
        store_tree_last_forgotten
            .put_key_val(
                &tree_last_forgotten_json_key,
                &tree_last_forgotten_json_value,
            )
            .unwrap();
        store_fmd
            .put_key_val(&fmd_json_key, &js_fmd_params_value)
            .unwrap();
        store_app
            .put_key_val(&app_json_key, &js_app_params_value)
            .unwrap();
        store_gas
            .put_key_val(&gas_json_key, &js_gas_prices_value)
            .unwrap();

        // -------------- 1. Query transaction plan performing a spend --------------

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

        let plan_js_value: JsValue = plan_transaction(
            js_constants_params_value,
            &planner_request.encode_to_vec(),
            full_viewing_key.encode_to_vec().as_slice(),
            STAKING_TOKEN_ASSET_ID.encode_to_vec().as_slice(),
        )
        .await
        .unwrap();
        let plan_proto: v1::TransactionPlan =
            serde_wasm_bindgen::from_value(plan_js_value.clone()).unwrap();
        let plan = TransactionPlan::try_from(plan_proto).unwrap();
        let plan_slice = &*plan.encode_to_vec();

        // -------------- 2. Generate authorization data from spend key and transaction plan --------------

        let spend_key = SpendKey::from_str(
            "penumbraspendkey1qul0huewkcmemljd5m3vz3awqt7442tjg2dudahvzu6eyj9qf0eszrnguh",
        )
        .unwrap();

        let authorization_data =
            authorize(spend_key.encode_to_vec().as_slice(), plan_slice).unwrap();

        // -------------- 3. Generate witness --------------

        // Retrieve SCT from storage.
        let tx_last_position: IdbTransaction<'_> = database_ref
            .transaction_on_one("TREE_LAST_POSITION")
            .unwrap();
        let store_last_position = tx_last_position.object_store("TREE_LAST_POSITION").unwrap();
        let value_last_position: Option<JsValue> = store_last_position
            .get_owned("last_position")
            .unwrap()
            .await
            .unwrap();

        let tx_last_forgotten = database_ref
            .transaction_on_one("TREE_LAST_FORGOTTEN")
            .unwrap();
        let store_last_forgotten = tx_last_forgotten
            .object_store("TREE_LAST_FORGOTTEN")
            .unwrap();
        let value_last_forgotten: Option<JsValue> = store_last_forgotten
            .get_owned("last_forgotten")
            .unwrap()
            .await
            .unwrap();

        let tx_commitments = database_ref.transaction_on_one("TREE_COMMITMENTS").unwrap();
        let store_commitments = tx_commitments.object_store("TREE_COMMITMENTS").unwrap();
        let value_commitments = store_commitments
            .get_owned("MY7PmcrH4fhjFOoMIKEdF+x9EUhZ9CS/CIfVco7Y5wU=")
            .unwrap()
            .await
            .unwrap();

        // Convert retrieved values to `JsValue`.
        let last_position_json: StoredPosition =
            serde_wasm_bindgen::from_value(value_last_position.unwrap()).unwrap();
        let last_forgotten_json: Forgotten =
            serde_wasm_bindgen::from_value(value_last_forgotten.unwrap()).unwrap();
        let commitments_jsvalue: StoreCommitment =
            serde_wasm_bindgen::from_value(JsValue::from(value_commitments.clone())).unwrap();

        // Reconstruct SCT struct.
        let vec_store_commitments: Vec<StoreCommitment> = vec![commitments_jsvalue.clone()];

        let sct = StoredTree {
            last_position: Some(last_position_json.clone()),
            last_forgotten: Some(last_forgotten_json),
            hashes: [].to_vec(),
            commitments: vec_store_commitments,
        };

        // Convert SCT to `JsValue`.
        let sct_json = serde_wasm_bindgen::to_value(&sct).unwrap();

        // Generate witness data from SCT and specific transaction plan.
        let witness_data = witness(plan_slice, sct_json).unwrap();

        // -------------- 4. Build the (1) Serial Transaction and (2) Parallel Transaction --------------

        let mut actions: Vec<Action> = Vec::new();

        for i in plan.actions.clone() {
            if let ActionPlan::Spend(ref _spend_plan) = i {
                let action_vec = build_action(
                    plan_slice,
                    i.encode_to_vec().as_slice(),
                    full_viewing_key.encode_to_vec().as_slice(),
                    &witness_data,
                )
                .unwrap();
                let action = Action::decode(&*action_vec).unwrap();
                actions.push(action);
            }
            if let ActionPlan::Output(ref _output_plan) = i {
                let action_vec = build_action(
                    plan_slice,
                    i.encode_to_vec().as_slice(),
                    full_viewing_key.encode_to_vec().as_slice(),
                    &witness_data,
                )
                .unwrap();
                let action = Action::decode(&*action_vec).unwrap();
                actions.push(action);
            }
        }

        // Deserialize actions.
        let action_deserialized: JsValue = serde_wasm_bindgen::to_value(&actions).unwrap();

        // Execute parallel spend transaction and generate proof.
        let parallel_transaction = build_parallel(
            action_deserialized,
            plan_slice,
            &witness_data,
            &authorization_data,
        )
        .unwrap();
        console_log!("Parallel transaction is: {:?}", parallel_transaction);

        // Execute serial spend transaction and generate proof.
        let serial_transaction = build(
            full_viewing_key.encode_to_vec().as_slice(),
            plan_slice,
            &witness_data,
            &authorization_data,
        )
        .unwrap();
        console_log!("Serial transaction is: {:?}", serial_transaction);

        // Deserialize transactions and stringify actions in the transaction body into JSON
        let serial_result = Transaction::decode(&*serial_transaction).unwrap();
        let parallel_result = Transaction::decode(&*parallel_transaction).unwrap();
        let serial_json = serde_json::to_string(&serial_result.transaction_body.actions).unwrap();
        let parallel_json =
            serde_json::to_string(&parallel_result.transaction_body.actions).unwrap();

        // Perform assertion check
        assert_eq!(serial_json, parallel_json);
    }
}
