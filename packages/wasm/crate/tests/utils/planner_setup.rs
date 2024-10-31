use penumbra_asset::STAKING_TOKEN_ASSET_ID;
use penumbra_fee::GasPrices;
use penumbra_proto::core::app::v1::AppParameters;
use penumbra_proto::core::component::sct::v1::SctParameters;
use penumbra_proto::DomainType;
use penumbra_shielded_pool::fmd::Parameters;

use penumbra_wasm::database::interface::Database;
use penumbra_wasm::database::mock::MockDb;
use penumbra_wasm::storage::{byte_array_to_base64, Tables};

#[allow(dead_code)]
pub async fn seed_params_in_db(mock_db: &MockDb, tables: &Tables) {
    let app_params = AppParameters {
        chain_id: "penumbra-deimos-8".to_string(),
        sct_params: Some(SctParameters {
            epoch_duration: 1000,
        }),
        community_pool_params: None,
        governance_params: None,
        ibc_params: None,
        stake_params: None,
        fee_params: None,
        distributions_params: None,
        funding_params: None,
        shielded_pool_params: None,
        dex_params: None,
        auction_params: None,
    };

    mock_db
        .put_with_key(&tables.app_parameters, "params", &app_params)
        .await
        .unwrap();

    let fmd_params = Parameters {
        precision: Default::default(),
        as_of_block_height: 0,
    };

    mock_db
        .put_with_key(&tables.fmd_parameters, "params", &fmd_params)
        .await
        .unwrap();

    let fee_id = *STAKING_TOKEN_ASSET_ID;

    let gas_prices = GasPrices {
        asset_id: fee_id,
        block_space_price: 60,
        compact_block_space_price: 1556,
        verification_price: 142,
        execution_price: 16,
    };

    mock_db
        .put_with_key(
            &tables.gas_prices,
            byte_array_to_base64(&fee_id.to_proto().inner),
            &gas_prices,
        )
        .await
        .unwrap();
}
