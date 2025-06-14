use penumbra_keys::{Address, FullViewingKey};

pub fn is_controlled_inner(fvk: &FullViewingKey, address: &Address) -> bool {
    fvk.address_index(address).is_some()
}
