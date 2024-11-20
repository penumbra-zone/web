mod utils;
use decaf377::Fq;
use penumbra_asset::asset::Id;
use penumbra_asset::{Value, STAKING_TOKEN_ASSET_ID};
use penumbra_dex::DexParameters;
use penumbra_keys::keys::AddressIndex;
use penumbra_keys::FullViewingKey;
use penumbra_proto::core::app::v1::AppParameters;
use penumbra_proto::core::component::fee::v1::GasPrices;
use penumbra_proto::core::keys::v1::Address as AddressProto;
use penumbra_proto::view::v1::transaction_planner_request::Output;
use penumbra_proto::view::v1::TransactionPlannerRequest;
use penumbra_proto::DomainType;
use penumbra_sct::params::SctParameters;
use penumbra_sct::{CommitmentSource, Nullifier};
use penumbra_shielded_pool::fmd::Parameters;
use penumbra_shielded_pool::{Note, Rseed};
use penumbra_tct::storage::StoredPosition;
use penumbra_tct::{Forgotten, Position, StateCommitment};
use penumbra_wasm::database::interface::Database;
use penumbra_wasm::database::mock::{get_mock_tables, MockDb};
use penumbra_wasm::note_record::SpendableNoteRecord;
use penumbra_wasm::planner::plan_transaction_inner;
use penumbra_wasm::storage::{byte_array_to_base64, Storage};
use penumbra_wasm::tx::witness_inner;
use penumbra_wasm::view_server::StoredTree;
use std::str::FromStr;
pub use utils::planner_setup::*;
use utils::sct::{
    Commitment, Position as PositionProto, SctUpdates, StoreCommitment,
    StoredPosition as StoredPositionProto, StoredTree as StoredTreeProto,
};

use wasm_bindgen_test::wasm_bindgen_test;
wasm_bindgen_test::wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
async fn test_witness() {
    // MockDb
    let mock_db = MockDb::new();
    let tables = get_mock_tables();

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

    // Decode the Bech32m string into the `Id` type
    let decoded_id =
        Id::from_str("passet1nupu8yg2kua09ec8qxfsl60xhafp7mmpsjv9pgp50t20hm6pkygscjcqn2")
            .expect("failed to decode assetId");

    // Convert the bytes into Fq field elements
    #[allow(deprecated)]
    let state_commitment = Fq::from_le_bytes_mod_order(
        &base64::decode("MY7PmcrH4fhjFOoMIKEdF+x9EUhZ9CS/CIfVco7Y5wU=").expect("state commitment"),
    );
    #[allow(deprecated)]
    let nullifier = Fq::from_le_bytes_mod_order(
        &base64::decode("8TvyFVKk16PHcOEAgl0QV4/92xdVpLdXI+zP87lBrQ8=").expect("nullifier"),
    );
    #[allow(deprecated)]
    let rseed: [u8; 32] = base64::decode("p2w4O1ognDJtKVqhHK2qsUbV+1AEM/gn58uWYQ5v3sM=")
        .expect("rssed")
        .try_into()
        .expect("Invalid base64 decoding");

    let spendable_note = SpendableNoteRecord {
        note_commitment: StateCommitment(state_commitment),
        note: Note::from_parts(
            AddressProto{ inner: "".into(), alt_bech32m: "penumbra1z7j020uafn2s8ths6xsjjvcay57thkfsuyrksaxja0jjz3ch2hdzljd6hpju8vzyupld25fld2lzmpzqe576nsr35c82e0u9hgphc76ldxlt7amx4xfc636w9cnnasl9nl4u2j".to_string() }.try_into().expect("msg"),
            Value {
                amount: 1000000u64.into(),
                asset_id: decoded_id,
            },
            Rseed(rseed),
        )
        .expect("note"),
        address_index: AddressIndex {
            account: 0,
            randomizer: [0; 12],
        },
        nullifier: Nullifier(nullifier),
        height_created: 250305,
        height_spent: None,
        position: 3204061134848.into(),
        source: CommitmentSource::Transaction {
            id: Some([
                160, 159, 65, 163, 219, 246, 218, 202, 237, 82, 98, 157, 76, 3, 21, 192, 243, 174,
                26, 233, 150, 19, 103, 0, 184, 22, 217, 29, 200, 188, 7, 82,
            ]),
        },
        return_address: None,
    };

    // Define a sample SCT update.
    #[allow(non_snake_case)]
    let sctUpdates = SctUpdates {
        store_commitments: StoreCommitment {
            commitment: Commitment {
                inner: "MY7PmcrH4fhjFOoMIKEdF+x9EUhZ9CS/CIfVco7Y5wU=".to_string(),
            },
            position: PositionProto {
                epoch: 746u64,
                block: 237u64,
                commitment: 0u64,
            },
        },
        set_position: StoredPositionProto {
            Position: PositionProto {
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
        memo: None,
        source: None,
        outputs: vec![Output {
            address: Some(AddressProto { inner: "".into(), alt_bech32m: "penumbra1dugkjttfezh4gfkqs77377gnjlvmkkehusx6953udxeescc0qpgk6gqc0jmrsjq8xphzrg938843p0e63z09vt8lzzmef0q330e5njuwh4290n8pemcmx70sasym0lcjkstgzc".to_string() }),
            value: Some(Value {
                amount: 1u64.into(),
                asset_id: decoded_id,
            }.into()),
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
    let tx_last_position: StoredPositionProto = mock_db
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
    let sct_proto = StoredTreeProto {
        last_position: Some(tx_last_position.clone()),
        last_forgotten: Some(tx_last_forgotten),
        hashes: [].to_vec(),
        commitments: vec_store_commitments,
    };

    let mut sct_tree: StoredTree =
        serde_wasm_bindgen::from_value(serde_wasm_bindgen::to_value(&sct_proto).unwrap())
            .expect("roundtrip tree conversion");

    // Generate witness data from SCT and specific transaction plan.
    witness_inner(transaction_plan.clone(), sct_tree.clone()).unwrap();

    // Modify the witness to use the default position. This will cause a failure
    // because the position must be witnessed in the tree to be valid.
    //
    // It's unclear how to test this because this results in a panic deeper in the
    // call stack that isn't propogated back to the caller?
    let s = StoredPosition::Position(Position::default());
    sct_tree.last_position = Some(s);
}
