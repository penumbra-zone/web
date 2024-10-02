extern crate core;

use penumbra_keys::keys::{
    AddressIndex, Bip44Path, SeedPhrase, SpendKey, SpendKeyBytes, WalletId, SPENDKEY_LEN_BYTES,
};
use penumbra_keys::{Address, FullViewingKey};
use penumbra_proto::{DomainType, Message};
use penumbra_wasm::keys::{
    generate_spend_key, get_address_by_index, get_full_viewing_key, get_wallet_id,
    is_controlled_address,
};
use rand_core::OsRng;
use std::str::FromStr;

const TEST_SEED_PHRASE: &str = "comfort ten front cycle churn burger oak absent rice ice urge result art couple benefit cabbage frequent obscure hurry trick segment cool job debate";

#[test]
fn generates_spend_key() {
    let slice = generate_spend_key(TEST_SEED_PHRASE).unwrap();
    let mut bytes = [0u8; SPENDKEY_LEN_BYTES];
    bytes.copy_from_slice(&slice[0..32]);

    let spend_key = SpendKey::from(SpendKeyBytes::from(bytes));
    assert_eq!(
        spend_key.to_string(),
        "penumbraspendkey1pgsphqgnltgy7hdspe4v74qefx2slp0v50szuup9fqutw5959gkq97v54y"
    );
}

#[test]
fn generates_fvk() {
    let spend_key = generate_spend_key(TEST_SEED_PHRASE).unwrap();
    let fvk_bytes = get_full_viewing_key(spend_key.as_slice()).unwrap();
    let fvk = FullViewingKey::decode(fvk_bytes.as_slice()).unwrap();
    assert_eq!(fvk.to_string(), "penumbrafullviewingkey1vzfytwlvq067g2kz095vn7sgcft47hga40atrg5zu2crskm6tyyjysm28qg5nth2fqmdf5n0q530jreumjlsrcxjwtfv6zdmfpe5kqsa5lg09");
}

#[test]
fn generates_wallet_id() {
    let spend_key = generate_spend_key(TEST_SEED_PHRASE).unwrap();
    let fvk_bytes = get_full_viewing_key(spend_key.as_slice()).unwrap();
    let wallet_id_bytes = get_wallet_id(fvk_bytes.as_slice()).unwrap();
    let wallet_id = WalletId::decode(wallet_id_bytes.as_slice()).unwrap();
    assert_eq!(
        wallet_id.to_string(),
        "penumbrawalletid172c36rsht9483decguzwg3x3p50kjxz9yh4f9luwdz8qyemc9vpsdw5j4m"
    );
}

#[test]
fn gets_address_by_index() {
    let spend_key = generate_spend_key(TEST_SEED_PHRASE).unwrap();
    let fvk_bytes = get_full_viewing_key(spend_key.as_slice()).unwrap();
    let address_bytes = get_address_by_index(fvk_bytes.as_slice(), 0).unwrap();
    let address = Address::decode(address_bytes.as_slice()).unwrap();
    assert_eq!(
        address.to_string(),
        "penumbra147mfall0zr6am5r45qkwht7xqqrdsp50czde7empv7yq2nk3z8yyfh9k9520ddgswkmzar22vhz9dwtuem7uxw0qytfpv7lk3q9dp8ccaw2fn5c838rfackazmgf3ahh09cxmz"
    );
}

#[test]
fn raises_if_fvk_invalid() {
    let invalid_fvk = vec![0, 1, 2, 3];
    let err = get_wallet_id(invalid_fvk.encode_to_vec().as_slice()).unwrap_err();
    assert_eq!(
        "Wrong byte length, expected 64 but found 4",
        err.to_string()
    );
}

#[test]
fn detects_controlled_addr() {
    let fvk = FullViewingKey::from_str("penumbrafullviewingkey1sjeaceqzgaeye2ksnz8q73mp6rpx2ykdtzs8wurrnhwdn8vqwuxhxtjdndrjc74udjh0uch0tatnrd93q50wp9pfk86h3lgpew8lsqsz2a6la").unwrap();
    let (addr, _) = fvk.payment_address(AddressIndex::new(0));
    assert!(is_controlled_address(&fvk.encode_to_vec(), &addr.encode_to_vec()).unwrap());
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
    assert!(!is_controlled_address(&fvk.encode_to_vec(), &other_address.encode_to_vec()).unwrap());
}
