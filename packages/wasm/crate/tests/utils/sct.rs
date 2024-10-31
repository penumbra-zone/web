use penumbra_tct::{structure::Hash, Forgotten};
use serde::{Deserialize, Serialize};

// Define utility SCT-related structs.
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
