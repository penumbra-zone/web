use penumbra_asset::STAKING_TOKEN_ASSET_ID;
use penumbra_keys::FullViewingKey;
use penumbra_proto::view::v1::TransactionPlannerRequest;
use std::str::FromStr;
use wasm_bindgen_test::wasm_bindgen_test;

use penumbra_wasm::database::mock::{get_mock_tables, MockDb};
use penumbra_wasm::planner::plan_transaction_inner;
use penumbra_wasm::storage::Storage;

use crate::utils::planner_setup::seed_params_in_db;

mod utils;

wasm_bindgen_test::wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
async fn test_planner_without_actions() {
    let mock_db = MockDb::new();
    let tables = get_mock_tables();

    seed_params_in_db(&mock_db, &tables).await;

    let storage = Storage::new(mock_db, tables).unwrap();

    #[allow(deprecated)]
    let req = TransactionPlannerRequest {
        expiry_height: 100,
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
        epoch_index: 0,
        epoch: None,
        fee_mode: None,
    };
    let full_viewing_key = FullViewingKey::from_str("penumbrafullviewingkey1mnm04x7yx5tyznswlp0sxs8nsxtgxr9p98dp0msuek8fzxuknuzawjpct8zdevcvm3tsph0wvsuw33x2q42e7sf29q904hwerma8xzgrxsgq2").unwrap();

    let res = plan_transaction_inner(storage, req, full_viewing_key, *STAKING_TOKEN_ASSET_ID)
        .await
        .unwrap();
    assert_eq!(res.transaction_parameters.chain_id, "penumbra-deimos-8");
    assert_eq!(res.transaction_parameters.expiry_height, 100);
    assert_eq!(res.actions.len(), 0);
    assert!(res.memo.is_none());
}
