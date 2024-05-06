# ADR 003: Visible and opaque fields in action views

https://github.com/penumbra-zone/web/issues/875. 

## 1. [Spend](https://buf.build/penumbra-zone/penumbra/docs/78be1d64b1cb484ba4bc666d54dc76c5:penumbra.core.component.shielded_pool.v1#penumbra.core.component.shielded_pool.v1.Spend) 

- `SpendBody`
    - $balance \ commitment$: <u><u>***visible***</u></u> field since the homomorphic pedersen commitment to the value of the input note has hiding and binding properties.  
    - $nullifier$: <u>***visible***</u> field since the nullifier is a $F_q$ element and reveals nothing about the note commitment it nullifies. 
    - $spend \ verification \ key$: <u>***visible***</u> field since the randomized verification key **rk** was derived from the spend authorization key $ak \isin \mathbb G$ given a witnessed spend authorization randomizer $\alpha \isin \mathbb F_r$, and $rk = ak+[α]B_{SpendAuth​}$ where the discrete log is hard over a large prime field. 
- `SpendAuthSignature`
    -  $authorization \ signature$: <u>***visible***</u> field since this is a Schnorr signature where the randomized verification key is derived from the verification key which is a group element $A = [a]B_D$, where scalar $a∈F_r$ is the signing key and $B_d$ is the generator. The <u>randomized</u> signing is $[r]A$, where r is a random 251-bit prime scalar field element for the decaf377 curve. Solving $[r]A$ is a hard discrete log problem over a large prime field. 
- `ZKSpendProof`
    - $proof$: <u>***visible***</u> field where the Groth16 proof is defined over the BLS12-377 prime field. 

## 2. [Output](https://buf.build/penumbra-zone/penumbra/docs/78be1d64b1cb484ba4bc666d54dc76c5:penumbra.core.component.shielded_pool.v1#penumbra.core.component.shielded_pool.v1.Output) 
- `OutputBody`
    - $NotePayload$
        - $note \ commitment$: <u>***visible***</u> field since the output note commitment is a $F_q$ element derived from a secure rate-5 Poseidon hashing scheme and blinded by a $F_q$ element. 
        - $ephemral \ key$: <u>***visible***</u> field since revealing the public key used to decrypt the note reveals nothing about the associated secret key, where $epk = [esk]B_d$.
        - $note \ ciphertext$: <u>***visible***</u> field since the note ciphertext is generated using a symmetric encryption ChaCha20Poly1305 algorithm. 
    - $balance \ commitment$: <u>***visible***</u> field (refer to the  explanation in the [Spend section](#1-spend))
    - $wrapped \ memo \ key$: <u>***visible***</u> field since the encrypted key for decrypting the memo was encrypted using the per-action payload key, which in-turn is a BLAKE2b-512 hash of various public keys,  commitments, and shared-secret. The shared secret is derived between sender and recipient by performing a secure Diffie-Hellman key exchange. 
    - $ovk \ wrapped \ key$: <u>***visible***</u> field since it's encrypted using the sender’s outgoing cipher key, which itself is a BLAKE2b-512 hash of public keys and commitments. 
- `ZKOutputProof`
    - $proof$: <u>***visible***</u> field where the Groth16 proof is defined over the BLS12-377 prime field. 

## 3. [Swap](https://buf.build/penumbra-zone/penumbra/docs/78be1d64b1cb484ba4bc666d54dc76c5:penumbra.core.component.dex.v1#penumbra.core.component.dex.v1.Swap) 
- `ZKSwapProof`
    - $proof$: <u>***visible***</u> field where the Groth16 proof is defined over the BLS12-377 prime field. 
- `SwapBody`
    - $trading \ pair$: <u>***visible***</u> field where the swap inputs and outputs are shown in the public view since (1) inputs are public because they are in the clear, and (2) outputs are also known because they can be computed by anyone with the BSOD. 
    - $amount$: <u>***visible***</u> field since one of the local invariants for a swap is that the swap reveals the amounts of those assets.
    - $balance \ commitment$: <u>***visible***</u> field (refer to the  explanation in the [Spend section](#1-spend))
    - `SwapPayload`
        - $swap commitment$: <u>***visible***</u> field since the swap commitment is a $F_q$ element derived from a secure Poseidon hashing scheme and blinded by a $F_q$ element. 
        - $encrypted swap$: <u>***visible***</u> field since the swap ciphertext is encrypted symmetrically using the payload key and reveals no more information about the swap that isn't already public. 