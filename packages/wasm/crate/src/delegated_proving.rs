use std::io::Cursor;

use ark_bls12_377::Bls12_377;
use ark_ec::pairing::Pairing;
use base64ct::{Base64, Encoding};
use circom_types::{
    traits::{CircomArkworksPairingBridge, CircomArkworksPrimeFieldBridge},
    Witness,
};
use co_circom_types::{CompressedRep3SharedWitness, Compression, Input, ShamirSharedWitness};
use crypto_box::PublicKey;
use ed25519_dalek::{Signature, VerifyingKey};
use rand::rngs::OsRng;
use sha2::{Digest as _, Sha512};
use uuid::Uuid;
use wasm_bindgen::prelude::*;

/// Seal the share with the given public key
#[wasm_bindgen]
pub fn seal_share(pk_b64: &str, share: Vec<u8>) -> Result<Vec<u8>, JsError> {
    let pk_bytes = Base64::decode_vec(pk_b64)?;
    let pk = PublicKey::from_bytes(
        pk_bytes
            .try_into()
            .map_err(|_| JsError::new("invalid key size"))?,
    );
    let ciphertext = pk
        .seal(&mut OsRng, &share)
        .map_err(|_| JsError::new("encryption error"))?;
    Ok(ciphertext)
}

/// Verify the signature with the given verifying key
#[wasm_bindgen]
pub fn verify_proof_result_signature(
    job_id: &str,
    proof_b64: &str,
    public_inputs_b64: &str,
    vk_b64: &str,
    signature_b64: &str,
) -> Result<(), JsError> {
    let job_id = job_id
        .parse::<Uuid>()
        .map_err(|_| JsError::new("invalid uuid"))?;
    let vk_bytes = Base64::decode_vec(vk_b64)?;
    let vk = VerifyingKey::from_bytes(
        &vk_bytes
            .try_into()
            .map_err(|_| JsError::new("invalid key size"))?,
    )?;
    let signature_bytes = Base64::decode_vec(signature_b64)?;
    let signature = Signature::from_bytes(
        &signature_bytes
            .try_into()
            .map_err(|_| JsError::new("invalid signature size"))?,
    );
    let proof_bytes = Base64::decode_vec(proof_b64)?;
    let public_inputs_bytes = Base64::decode_vec(public_inputs_b64)?;

    let mut digest = Sha512::new();
    digest.update(job_id.as_bytes());
    digest.update(proof_bytes);
    digest.update(public_inputs_bytes);

    vk.verify_prehashed_strict(
        digest,
        Some("taceo-proof-nps-reporting".as_bytes()),
        &signature,
    )
    .map_err(|_| JsError::new("signature verification failed"))?;

    Ok(())
}

/// A serialized REP3 shared input
#[wasm_bindgen(getter_with_clone)]
pub struct SerializedRep3SharedInput {
    pub shares0: Vec<u8>,
    pub shares1: Vec<u8>,
    pub shares2: Vec<u8>,
}

fn split_input_rep3<P>(
    input: JsValue,
    public_inputs: Vec<String>,
) -> Result<SerializedRep3SharedInput, JsError>
where
    P: Pairing + CircomArkworksPairingBridge,
    P::ScalarField: CircomArkworksPrimeFieldBridge,
    P::BaseField: CircomArkworksPrimeFieldBridge,
{
    let input = serde_wasm_bindgen::from_value::<Input>(input)?;
    let res = co_circom_types::split_input::<P::ScalarField>(input, &public_inputs)
        .map_err(|err| JsError::new(&format!("failed to parse and split input: {err}")))?;
    Ok(SerializedRep3SharedInput {
        shares0: bincode::serialize(&res[0]).map_err(|e| JsError::new(&e.to_string()))?,
        shares1: bincode::serialize(&res[1]).map_err(|e| JsError::new(&e.to_string()))?,
        shares2: bincode::serialize(&res[2]).map_err(|e| JsError::new(&e.to_string()))?,
    })
}

/// Split the input into REP3 shares.
#[wasm_bindgen]
pub fn split_input_rep3_bls12_377(
    input: JsValue,
    public_inputs: Vec<String>,
) -> Result<SerializedRep3SharedInput, JsError> {
    split_input_rep3::<Bls12_377>(input, public_inputs)
}

/// A serialized REP3 shared witness
#[wasm_bindgen(getter_with_clone)]
pub struct SerializedRep3SharedWitness {
    pub shares0: Vec<u8>,
    pub shares1: Vec<u8>,
    pub shares2: Vec<u8>,
}

fn split_witness_rep3<P>(
    witness: Vec<u8>,
    num_pub_inputs: usize,
) -> Result<SerializedRep3SharedWitness, JsError>
where
    P: Pairing + CircomArkworksPairingBridge,
    P::ScalarField: CircomArkworksPrimeFieldBridge,
    P::BaseField: CircomArkworksPrimeFieldBridge,
{
    let witness: Witness<P::ScalarField> = Witness::from_reader(Cursor::new(witness))?;
    let mut rng = rand::thread_rng();
    let res = CompressedRep3SharedWitness::share_rep3(
        witness,
        num_pub_inputs,
        &mut rng,
        Compression::SeededHalfShares,
    );
    Ok(SerializedRep3SharedWitness {
        shares0: bincode::serialize(&res[0]).map_err(|e| JsError::new(&e.to_string()))?,
        shares1: bincode::serialize(&res[1]).map_err(|e| JsError::new(&e.to_string()))?,
        shares2: bincode::serialize(&res[2]).map_err(|e| JsError::new(&e.to_string()))?,
    })
}

/// Split the witness into Shamir shares.
#[wasm_bindgen]
pub fn split_witness_rep3_bls12_377(
    witness: Vec<u8>,
    num_pub_inputs: usize,
) -> Result<SerializedRep3SharedWitness, JsError> {
    split_witness_rep3::<Bls12_377>(witness, num_pub_inputs)
}

/// A serialized Shamir shared witness
#[wasm_bindgen(getter_with_clone)]
pub struct SerializedShamirSharedWitness {
    pub shares0: Vec<u8>,
    pub shares1: Vec<u8>,
    pub shares2: Vec<u8>,
}

fn split_witness_shamir<P>(
    witness: Vec<u8>,
    num_pub_inputs: usize,
) -> Result<SerializedShamirSharedWitness, JsError>
where
    P: Pairing + CircomArkworksPairingBridge,
    P::ScalarField: CircomArkworksPrimeFieldBridge,
    P::BaseField: CircomArkworksPrimeFieldBridge,
{
    let witness: Witness<P::ScalarField> = Witness::from_reader(Cursor::new(witness))?;
    let mut rng = rand::thread_rng();
    let res = ShamirSharedWitness::share_shamir(witness, num_pub_inputs, 1, 3, &mut rng);
    Ok(SerializedShamirSharedWitness {
        shares0: bincode::serialize(&res[0]).map_err(|e| JsError::new(&e.to_string()))?,
        shares1: bincode::serialize(&res[1]).map_err(|e| JsError::new(&e.to_string()))?,
        shares2: bincode::serialize(&res[2]).map_err(|e| JsError::new(&e.to_string()))?,
    })
}

/// Split the witness into Shamir shares.
#[wasm_bindgen]
pub fn split_witness_shamir_bls12_377(
    witness: Vec<u8>,
    num_pub_inputs: usize,
) -> Result<SerializedShamirSharedWitness, JsError> {
    split_witness_shamir::<Bls12_377>(witness, num_pub_inputs)
}
