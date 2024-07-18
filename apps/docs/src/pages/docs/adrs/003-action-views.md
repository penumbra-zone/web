# ADR 003: opaque and opaque fields in views

This specification is intended to inform what information should be comprehended by the user during signing a penumbra transaction. The <u><u>**_visible_**</u></u> views require a viewing key, the <u><u>**_opaque_**</u></u> views are public. Fields tagged as <u><u>**_opaque_**</u></u> are optionally also <u><u>**_visible_**</u></u> fields, but the opposite is false. For each view, we enumerate the protobuf fields and mark them accordingly. This is tracked by https://github.com/penumbra-zone/web/issues/875.

## 1. [Spend View](https://buf.build/penumbra-zone/penumbra/docs/78be1d64b1cb484ba4bc666d54dc76c5:penumbra.core.component.shielded_pool.v1#penumbra.core.component.shielded_pool.v1.Spend)

- `Spend`
  - `SpendBody`
    - `BalanceCommitment`: <u><u>**_opaque_**</u></u> field since the homomorphic pedersen commitment to the value of the input note has hiding and binding properties.
    - `Nullifier`: <u>**_opaque_**</u> field since the nullifier is a $F_q$ element and reveals nothing about the note commitment it nullifies.
    - `SpendVerificationKey`: <u>**_opaque_**</u> field since the randomized verification key **rk** was derived from the spend authorization key $ak \isin \mathbb G$ given a witnessed spend authorization randomizer $\alpha \isin \mathbb F_r$, and $rk = ak+[α]B_{SpendAuth​}$ where the discrete log is hard over a large prime field.
  - `SpendAuthSignature`: <u>**_opaque_**</u> field since this is a Schnorr signature where the randomized verification key is derived from the verification key which is a group element $A = [a]B_D$, where scalar $a∈F_r$ is the signing key and $B_d$ is the generator. The <u>randomized</u> signing is $[r]A$, where r is a random 251-bit prime scalar field element for the decaf377 curve. Solving $[r]A$ is a hard discrete log problem over a large prime field.
  - `ZKSpendProof`: <u>**_opaque_**</u> field where the Groth16 proof is defined over the BLS12-377 prime field.
- `NoteView`: <u>**_visible_**</u> field since it contains address and value views that meant to remain hidden.

## 2. [Output View](https://buf.build/penumbra-zone/penumbra/docs/78be1d64b1cb484ba4bc666d54dc76c5:penumbra.core.component.shielded_pool.v1#penumbra.core.component.shielded_pool.v1.Output)

- `Output`
  - `OutputBody`
    - `NotePayload`
      - `StateCommitment`: <u>**_opaque_**</u> field since the output note commitment is a $F_q$ element derived from a secure rate-5 Poseidon hashing scheme and blinded by a $F_q$ element.
      - `WphemralPublicKey`: <u>**_opaque_**</u> field since revealing the public key used to decrypt the note reveals nothing about the associated secret key, where $epk = [esk]B_d$.
      - `NoteCiphertext`: <u>**_opaque_**</u> field since the note ciphertext is generated using a symmetric encryption ChaCha20Poly1305 algorithm.
    - `balanceCommitment`: <u>**_opaque_**</u> field (refer to the same explanation in the [Spend section](#1-spend-view))
    - `WrappedMemoKey`: <u>**_opaque_**</u> field since the encrypted key for decrypting the memo was encrypted using the per-action payload key, which in-turn is a BLAKE2b-512 hash of various public keys, commitments, and shared-secret. The shared secret is derived between sender and recipient by performing a secure Diffie-Hellman key exchange.
    - `OvkWrappedKey`: <u>**_opaque_**</u> field since it's encrypted using the sender’s outgoing cipher key, which itself is a BLAKE2b-512 hash of public keys and commitments.
  - `ZKOutputProof`: <u>**_opaque_**</u> field where the Groth16 proof is defined over the BLS12-377 prime field.
- `NoteView`: <u>**_visible_**</u> field (refer to the same explanation in the [Spend section](#1-spend-view))
- `PayloadKey`: <u>**_visible_**</u> field since payload keys provide decryption capabilities of encrypted note ciphertexts.

## 3. [Swap View](https://buf.build/penumbra-zone/penumbra/docs/78be1d64b1cb484ba4bc666d54dc76c5:penumbra.core.component.dex.v1#penumbra.core.component.dex.v1.Swap)

- `Swap`
  - `ZKSwapProof`: <u>**_opaque_**</u> field where the Groth16 proof is defined over the BLS12-377 prime field.
  - `SwapBody`
    - `TradingPair`: <u>**_opaque_**</u> field where the swap inputs and outputs are shown in the public view since (1) inputs are public because they are in the clear, and (2) outputs are also known because they can be computed by anyone with the BSOD.
    - `Amount`: <u>**_opaque_**</u> field since one of the local invariants for a swap is that the swap reveals the input amount of the asset.
    - `Amount`: <u>**_opaque_**</u> field since one of the local invariants for a swap is that the swap reveals the output amount of the asset.
    - `BalanceCommitment`: <u>**_opaque_**</u> field (refer to the same explanation in the [Spend section](#1-spend-view))
    - `SwapPayload`
      - `StateCommitment`: <u>**_opaque_**</u> field since the swap commitment is a $F_q$ element derived from a secure Poseidon hashing scheme and blinded by a $F_q$ element.
      - `EncryptedSwap`: <u>**_opaque_**</u> field since the swap ciphertext is encrypted symmetrically using the visible payload key and reveals no more information about the swap that isn't already public.
- `BatchSwapOutputData`: <u>**_opaque_**</u> field since the BSOD in the TxP does not leak any information about the specific output notes that the view service computes for the swap using the BSOD. Computing the output notes already assumes decrypting the swap ciphertext. The BSOD contains the results of the batch swap and is emitted in an event.
- `ValueView`: <u>**_opaque_**</u> field since the swap values are in the clear.
- `Metadata`: <u>**_opaque_**</u> field and the metadata is reported on-chain.
- `SwapPlaintext`: <u>**_visible_**</u> field since the decrypted swap ciphertext enables, alongside the BSOD, to retrieve output notes, which amonst other fields includes the private address controlling the note.
- `TransactionId`: <u>**_visible_**</u> field since it's associated with a commitment that will eventually be nullified, and since nullifiers are public, revealing the transaction ID creates a link between the commitment and the nullifier that commitment nullifies.
- `NoteView`: <u>**_visible_**</u> field since it consists of sensitive fields like the claim address which should not be leaked.

## 4. [Swap Claim View](https://buf.build/penumbra-zone/penumbra/docs/78be1d64b1cb484ba4bc666d54dc76c5/penumbra.core.component.dex.v1#penumbra.core.component.dex.v1.SwapClaim)

- `Swap Claim`
  - `ZKSwapProof`: <u>**_opaque_**</u> field where the Groth16 proof is defined over the BLS12-377 prime field.
  - `SwapClaimBody`
    - `Nullifier`: <u>**_opaque_**</u> field (refer to the same explanation in the [Spend section](#1-spend-view))
    - `Fee`: <u>**_opaque_**</u> field since the prepaid fee is a public field.
    - `StateCommitment`: <u>**_opaque_**</u> field since the output note commitment for assets 1 is interpretted as $F_q$ elements (constrained to 128-bits) derived from a secure rate-5 Poseidon hashing scheme and blinded by a $F_q$ element.
    - `StateCommitment`: <u>**_opaque_**</u> field since the output note commitment for asset 2 is interpretted as $F_q$ elements (constrained to 128-bits) derived from a secure rate-5 Poseidon hashing scheme and blinded by a $F_q$ element.
    - `BatchSwapOutputData`: <u>**_opaque_**</u> field (refer to the same explanation in the [Swap section](#3-swap-view))
- `EpochDuration` - <u>**_opaque_**</u> field since this is included as part of the chain state.

## 5. [Delegate View](https://buf.build/penumbra-zone/penumbra/docs/78be1d64b1cb484ba4bc666d54dc76c5:penumbra.core.component.stake.v1#penumbra.core.component.stake.v1.Delegate)

- `Delegate`

  - `IdentityKey`: <u>**_opaque_**</u> field since the validator's identity (decaf377-rdsa spendauth verification key) is supposed to be public, while individual delegators are kept private.
  - `Epoch`: <u>**_opaque_**</u> field since this is included as part of the chain state.
  - `Amount`: <u>**_opaque_**</u> field since the unbounded amount is public until flow encryption is supported to only display batched amounts per block.
  - `Amount`: <u>**_opaque_**</u> field since the delegation amount is determined by validator's exchange rate, which is public.

  ## 6. [Undelegate View](https://buf.build/penumbra-zone/penumbra/docs/78be1d64b1cb484ba4bc666d54dc76c5:penumbra.core.component.stake.v1#penumbra.core.component.stake.v1.Undelegate)

- `Undelegate`
  - `IdentityKey`: <u>**_opaque_**</u> field (refer to the same explanation in the [Delegate section](#5-delegate-view)).
  - `Amount`: <u>**_opaque_**</u> field (refer to the same explanation in the [Delegate section](#5-delegate-view)).
  - `Amount`: <u>**_opaque_**</u> field (refer to the same explanation in the [Delegate section](#5-delegate-view)).
  - `Epoch`: <u>**_opaque_**</u> field (refer to the same explanation in the [Delegate section](#5-delegate-view)).

## 7. [UndelegateClaim View](https://buf.build/penumbra-zone/penumbra/docs/78be1d64b1cb484ba4bc666d54dc76c5:penumbra.core.component.stake.v1#penumbra.core.component.stake.v1.UndelegateClaim)

- `UndelegateClaim `
  - `IdentityKey`: <u>**_opaque_**</u> field (refer to the same explanation in the [Delegate section](#5-delegate-view)).
  - `Penalty`: <u>**_opaque_**</u> field since this is part of the on-chain data.
  - `BalanceCommitment`: <u>**_opaque_**</u> field since the pedersen commitment reveals not data about the note balances.
  - `UnbondingStartHeight`: <u>**_opaque_**</u> field since this is recorded publicly on-chain.

## 8. [ActionDutchAuctionSchedule View](https://buf.build/penumbra-zone/penumbra/docs/78be1d64b1cb484ba4bc666d54dc76c5/penumbra.core.component.auction.v1alpha1#penumbra.core.component.auction.v1alpha1.ActionDutchAuctionSchedule)

- `ActionDutchAuctionSchedule`
  - `DutchAuctionDescription`: <u>**_opaque_**</u> field since the amounts and asset types can be public similiar to swaps.
  - `AuctionId`: <u>**_opaque_**</u> field since the unique identifier reveals no information about the auction.
  - `Metadata`: <u>**_opaque_**</u> field that augments the view with additional input and output metadata to assist clients in rendering its contents.

## 9. [ActionDutchAuctionEnd View](https://buf.build/penumbra-zone/penumbra/docs/78be1d64b1cb484ba4bc666d54dc76c5:penumbra.core.component.auction.v1alpha1#penumbra.core.component.auction.v1alpha1.ActionDutchAuctionEnd)

- `ActionDutchAuctionEnd`
  - `AuctionId`: <u>**_opaque_**</u> field since the unique identifier reveals no information about the auction.

## 10. [ActionDutchAuctionWithdraw View](https://buf.build/penumbra-zone/penumbra/docs/78be1d64b1cb484ba4bc666d54dc76c5:penumbra.core.component.auction.v1alpha1#penumbra.core.component.auction.v1alpha1.ActionDutchAuctionWithdraw)

- `ActionDutchAuctionEnd`
  - `AuctionId`: <u>**_opaque_**</u> field (refer to the same explanation in the [ActionDutchAuctionSchedule section](#1-delegate)).
  - `SequenceNumber`: <u>**_opaque_**</u> field since it only reveals the state (active or inactive) of the auction.
  - `BalanceCommitment`: <u>**_opaque_**</u> field since the pedersen commitment reveals not data about the note balances.
