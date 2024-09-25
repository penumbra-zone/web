extern crate core;

use penumbra_keys::keys::{AddressIndex, Bip44Path, SeedPhrase, SpendKey};
use penumbra_keys::FullViewingKey;
use penumbra_proto::core::keys::v1::WalletId;
use penumbra_proto::{DomainType, Message};
use penumbra_wasm::keys::{get_wallet_id, is_controlled_inner};
use rand_core::OsRng;
use std::str::FromStr;
use wasm_bindgen_test::wasm_bindgen_test;

#[test]
fn successfully_get_wallet_id() {
    let fvk = FullViewingKey::from_str("penumbrafullviewingkey1sjeaceqzgaeye2ksnz8q73mp6rpx2ykdtzs8wurrnhwdn8vqwuxhxtjdndrjc74udjh0uch0tatnrd93q50wp9pfk86h3lgpew8lsqsz2a6la").unwrap();
    let wallet_id = WalletId::decode(
        get_wallet_id(fvk.encode_to_vec().as_slice())
            .unwrap()
            .as_slice(),
    )
    .unwrap();
    let expected_bech32_str =
        "penumbrawalletid15r7q7qsf3hhsgj0g530n7ng9acdacmmx9ajknjz38dyt90u9gcgsmjre75".to_string();
    let walet_id_str = penumbra_keys::keys::WalletId::try_from(wallet_id)
        .unwrap()
        .to_string();

    assert_eq!(expected_bech32_str, walet_id_str);
}

#[wasm_bindgen_test]
fn raises_if_fvk_invalid() {
    let fvk = FullViewingKey::from_str("penumbrafullviewingkey1sjeaceqzgaeye2ksnz8q73mp6rpx2ykdtzs8wurrnhwdn8vqwuxhxtjdndrjc74udjh0uch0tatnrd93q50wp9pfk86h3lgpew8lsqsz2a6la").unwrap();
    let err = get_wallet_id(fvk.encode_to_vec().as_slice()).unwrap_err();
    assert_eq!("invalid length", err.to_string());
}

#[test]
fn detects_controlled_addr() {
    let fvk = FullViewingKey::from_str("penumbrafullviewingkey1sjeaceqzgaeye2ksnz8q73mp6rpx2ykdtzs8wurrnhwdn8vqwuxhxtjdndrjc74udjh0uch0tatnrd93q50wp9pfk86h3lgpew8lsqsz2a6la").unwrap();
    let (addr, _) = fvk.payment_address(AddressIndex::new(0));
    assert!(is_controlled_inner(&fvk, &addr));
}

#[test]
fn returns_false_on_unknown_addr() {
    let fvk = FullViewingKey::from_str("penumbrafullviewingkey1sjeaceqzgaeye2ksnz8q73mp6rpx2ykdtzs8wurrnhwdn8vqwuxhxtjdndrjc74udjh0uch0tatnrd93q50wp9pfk86h3lgpew8lsqsz2a6la").unwrap();
    let other_address =
        SpendKey::from_seed_phrase_bip44(SeedPhrase::generate(OsRng), &Bip44Path::new(0))
            .full_viewing_key()
            .incoming()
            .payment_address(AddressIndex::from(0u32))
            .0;
    assert!(!is_controlled_inner(&fvk, &other_address));
}
