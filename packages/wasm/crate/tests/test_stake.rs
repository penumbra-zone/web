use penumbra_proto::core::asset::v1::Metadata;
use penumbra_proto::DomainType;
use penumbra_stake::IdentityKey;
use penumbra_wasm::stake::get_delegation_asset;
use prost::Message;
use std::str::FromStr;

#[test]
fn gets_delegation_metadata() {
    let identity_key = IdentityKey::from_str(
        "penumbravalid19caff39080amxlupcjutnhcm7vh8rjfevza0hpx33pn7lntf6vyqvuekzh",
    )
    .unwrap();
    let metadata_bytes = get_delegation_asset(&identity_key.encode_to_vec()).unwrap();
    let metadata = Metadata::decode(metadata_bytes.as_slice()).unwrap();
    assert_eq!(
        metadata.base,
        "udelegation_penumbravalid19caff39080amxlupcjutnhcm7vh8rjfevza0hpx33pn7lntf6vyqvuekzh"
    )
}
