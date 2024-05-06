# ADR 003: Visible and opaque fields in action views

https://github.com/penumbra-zone/web/issues/875. 


## 1. [Spend](https://buf.build/penumbra-zone/penumbra/docs/78be1d64b1cb484ba4bc666d54dc76c5:penumbra.core.component.shielded_pool.v1#penumbra.core.component.shielded_pool.v1.Spend) 

- `SpendBody`
    - <u>BalanceCommitment</u>: field is <u><u>***visible***</u></u> since the homomorphic pedersen commitment to the value of the input note has hiding and binding properties.  
    - <u>Nullifier</u>: field is <u>***visible***</u> since the nullifier is a $F_q$ element and reveals nothing about the note commitment it nullifies. 
    - <u>SpendVerificationKey</u>: field is <u>***visible***</u> since the randomized verification key **rk** was derived from the spend authorization key $ak \isin \mathbb G$ given a witnessed spend authorization randomizer $\alpha \isin \mathbb F_r$, and $rk = ak+[α]B_{SpendAuth​}$ where the discrete log is hard over a large prime field. 
- `SpendAuthSignature`
    -  field is <u>***visible***</u> since this is a Schnorr signature where the randomized verification key is derived from the verification key which is a group element $A = [a]B_D$, where scalar $a∈F_r$ is the signing key and $B_d$ is the generator. The <u>randomized</u> signing is $[r]A$, where r is a random 251-bit prime scalar field element for the decaf377 curve. Solving $[r]A$ is a hard discrete log problem over a large prime field. 
- `ZKSpendProof`
    - field is <u>***visible***</u> since the Groth16 proof is defined over the BLS12-377 prime field. 

## 2. [Output](https://buf.build/penumbra-zone/penumbra/docs/78be1d64b1cb484ba4bc666d54dc76c5:penumbra.core.component.shielded_pool.v1#penumbra.core.component.shielded_pool.v1.Output) 
- `OutputBody`
    - <u>NotePayload</u> 
        - <u>StateCommitment</u>: field is <u>***visible***</u> since the output note commitment is derived from a secure rate-6 Poseidon hashing scheme and blinded by a $F_q$ element. 
        - <u>EphemeralKey</u>: field is <u>***visible***</u> since revealing the public key used to decrypt the note reveals nothing about the associated secret key, where $epk = [esk]B_d$.
        - <u>NoteCiphertext</u>: field is <u>***visible***</u> since the note ciphertext is generated using a symmetric encryption ChaCha20Poly1305 algorithm. 
    - <u>BalanceCommitment</u>: field is <u>***visible***</u> (refer to the  explanation in the [Spend section](#1-spend))
    - <u>WrappedMemoKey</u>: field is <u>***visible***</u> since the encrypted key for decrypting the memo was encrypted using the per-action payload key, which in-turn is a BLAKE2b-512 hash of various public keys,  commitments, and shared-secret. The shared secret derived between sender and recipient by performing a secure Diffie-Hellman key exchange. 
    - <u>OVKWrappedKey</u>: field is <u>***visible***</u> since it's encrypted using the sender’s outgoing cipher key, which itself is a BLAKE2b-512 hash of public keys and commitments. 
- `ZKSpendProof`
    - field is <u>***visible***</u> since the Groth16 proof is defined over the BLS12-377 prime field. 

## 3. [Swap](https://buf.build/penumbra-zone/penumbra/docs/78be1d64b1cb484ba4bc666d54dc76c5:penumbra.core.component.dex.v1#penumbra.core.component.dex.v1.Swap) 