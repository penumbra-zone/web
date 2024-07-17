use penumbra_asset::asset::Metadata;
use penumbra_asset::{Value, STAKING_TOKEN_ASSET_ID};
use penumbra_keys::Address;
use penumbra_proto::core::asset::v1 as pb;
use penumbra_sct::{CommitmentSource, Nullifier};
use penumbra_shielded_pool::Note;
use penumbra_tct::StateCommitment;
use rand_core::OsRng;
use wasm_bindgen_test::wasm_bindgen_test;

use penumbra_wasm::database::interface::Database;
use penumbra_wasm::database::mock::{get_mock_tables, MockDb};
use penumbra_wasm::note_record::SpendableNoteRecord;
use penumbra_wasm::storage::Storage;

wasm_bindgen_test::wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
async fn test_get_delegation_assets_filters_correctly() {
    let mock_db = MockDb::new();
    let tables = get_mock_tables();

    let metadata_a_proto = pb::Metadata {
        base:
            "udelegation_penumbravalid1hz2hqlgx4w55vkxzv0n3u93czlkvm6zpgftyny2psg3dp8vcygxqd7fedt"
                .to_string(),
        ..Default::default()
    };
    mock_db
        .put_with_key(&tables.assets, "metadata_a", &metadata_a_proto)
        .await
        .unwrap();

    let metadata_b_proto = pb::Metadata {
        base:
            "udelegation_penumbravalid18jfq3tvrnzpeuzj6yq25v4spmttc08gwjdtjk4r77xcsyyaz6c9qutgtch"
                .to_string(),
        ..Default::default()
    };
    mock_db
        .put_with_key(&tables.assets, "metadata_b", &metadata_b_proto)
        .await
        .unwrap();

    let metadata_c_proto = pb::Metadata {
        base: "lpnft_opened_plpid1sp8a79edvlphkqgt8ps4p7mln8xx3wa2a84trudjur86cfd00mkq2350l9"
            .to_string(),
        ..Default::default()
    };
    mock_db
        .put_with_key(&tables.assets, "metadata_c", &metadata_c_proto)
        .await
        .unwrap();

    let storage = Storage::new(mock_db, tables).unwrap();

    // Only two of the assets should have been returned
    let map = storage.get_delegation_assets().await.unwrap();
    assert_eq!(map.len(), 2);

    // Ensure it's the two with udelegation... base denoms
    let metadata_a: Metadata = metadata_a_proto.try_into().unwrap();
    assert!(map.contains_key(&metadata_a.id()));

    let metadata_b: Metadata = metadata_b_proto.try_into().unwrap();
    assert!(map.contains_key(&metadata_b.id()));
}

#[wasm_bindgen_test]
async fn test_no_delegation_notes() {
    let mock_db = MockDb::new();
    let tables = get_mock_tables();

    let addr = Address::dummy(&mut OsRng);
    let value = Value {
        amount: 10u64.into(),
        asset_id: *STAKING_TOKEN_ASSET_ID,
    };

    let note_a = SpendableNoteRecord {
        note_commitment: StateCommitment::try_from([0; 32]).unwrap(),
        note: Note::generate(&mut OsRng, &addr, value),
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
        .put_with_key(&tables.spendable_notes, "note_a", &note_a)
        .await
        .unwrap();

    let storage = Storage::new(mock_db, tables).unwrap();

    let result = storage.get_notes_for_voting(None, 142).await.unwrap();
    assert_eq!(result.len(), 0);
}

#[wasm_bindgen_test]
async fn test_ineligible_note_criteria() {
    let mock_db = MockDb::new();
    let tables = get_mock_tables();

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

    let metadata_not_in_db_proto = pb::Metadata {
        base:
            "udelegation_penumbravalid1aglayhqq2ec5yfgx8ljqrd9ypnma5uu46hsd0d77dakgu4nywuyqk29d0m"
                .to_string(),
        ..Default::default()
    };
    let metadata_not_in_db: Metadata = metadata_not_in_db_proto.try_into().unwrap();

    let no_metadata_for_del_token = SpendableNoteRecord {
        note_commitment: StateCommitment::try_from([0; 32]).unwrap(),
        note: Note::generate(
            &mut OsRng,
            &Address::dummy(&mut OsRng),
            Value {
                amount: 10u64.into(),
                asset_id: metadata_not_in_db.id(),
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
        .put_with_key(
            &tables.spendable_notes,
            "no_metadata_for_del_token",
            &no_metadata_for_del_token,
        )
        .await
        .unwrap();

    let note_created_at_vote_height = SpendableNoteRecord {
        note_commitment: StateCommitment::try_from([0; 32]).unwrap(),
        note: Note::generate(
            &mut OsRng,
            &Address::dummy(&mut OsRng),
            Value {
                amount: 10u64.into(),
                asset_id: metadata_in_db.id(),
            },
        ),
        address_index: Default::default(),
        nullifier: Nullifier::try_from(vec![
            76, 12, 37, 160, 207, 93, 129, 238, 230, 254, 29, 227, 107, 97, 138, 12, 172, 130, 138,
            66, 123, 217, 253, 148, 178, 91, 112, 125, 247, 32, 189, 2,
        ])
        .unwrap(),
        height_created: 42,
        height_spent: None,
        position: Default::default(),
        source: CommitmentSource::Genesis,
        return_address: None,
    };

    mock_db
        .put_with_key(
            &tables.spendable_notes,
            "note_created_at_vote_height",
            &note_created_at_vote_height,
        )
        .await
        .unwrap();

    let note_created_after_vote_height = SpendableNoteRecord {
        note_commitment: StateCommitment::try_from([0; 32]).unwrap(),
        note: Note::generate(
            &mut OsRng,
            &Address::dummy(&mut OsRng),
            Value {
                amount: 10u64.into(),
                asset_id: metadata_in_db.id(),
            },
        ),
        address_index: Default::default(),
        nullifier: Nullifier::try_from(vec![
            76, 12, 37, 160, 207, 93, 129, 238, 230, 254, 29, 227, 107, 97, 138, 12, 172, 130, 138,
            66, 123, 217, 253, 148, 178, 91, 112, 125, 247, 32, 189, 2,
        ])
        .unwrap(),
        height_created: 12222,
        height_spent: None,
        position: Default::default(),
        source: CommitmentSource::Genesis,
        return_address: None,
    };

    mock_db
        .put_with_key(
            &tables.spendable_notes,
            "note_created_after_vote_height",
            &note_created_after_vote_height,
        )
        .await
        .unwrap();

    let note_spent_before_vote_height = SpendableNoteRecord {
        note_commitment: StateCommitment::try_from([0; 32]).unwrap(),
        note: Note::generate(
            &mut OsRng,
            &Address::dummy(&mut OsRng),
            Value {
                amount: 10u64.into(),
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
        height_spent: Some(5),
        position: Default::default(),
        source: CommitmentSource::Genesis,
        return_address: None,
    };

    mock_db
        .put_with_key(
            &tables.spendable_notes,
            "note_spent_before_vote_height",
            &note_spent_before_vote_height,
        )
        .await
        .unwrap();

    let storage = Storage::new(mock_db, tables).unwrap();

    let result = storage.get_notes_for_voting(None, 42).await.unwrap();
    assert_eq!(result.len(), 0);
}

#[wasm_bindgen_test]
async fn test_eligible_notes() {
    let mock_db = MockDb::new();
    let tables = get_mock_tables();

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

    let eligible_c = SpendableNoteRecord {
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
        height_created: 6,
        height_spent: Some(100),
        position: Default::default(),
        source: CommitmentSource::Genesis,
        return_address: None,
    };

    mock_db
        .put_with_key(&tables.spendable_notes, "eligible_c", &eligible_c)
        .await
        .unwrap();

    let storage = Storage::new(mock_db, tables).unwrap();

    let result = storage.get_notes_for_voting(None, 42).await.unwrap();
    assert_eq!(result.len(), 3);
}
