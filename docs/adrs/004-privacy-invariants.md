# ADR 004: Privacy and Security Invariants

Following the documentation of [integrity invariants](https://github.com/penumbra-zone/penumbra/issues/3867) in the protocol spec for each action containing a proof and the description of [privacy invariants](https://github.com/penumbra-zone/penumbra/issues/3997) for each action, we aim to compile a comprehensive list of privacy / security-related invariants for the web code. This compilation is motivated by the same principles of ensuring robustness and security. This is tracked by the the following [tracking issue](https://github.com/orgs/penumbra-zone/projects/20/views/6?pane=issue&itemId=569114927).

### Prax Extension

```
Invariant 1.

The extension must ensure that its local and session storage states are adequately protected to prevent the leakage of sensitive information to potential attackers.
```

[Chrome's Storage API](https://developer.chrome.com/docs/extensions/reference/api/storage) provides an extension specific way to persist user state and data. Particularly, the extension's service worker and content scripts have access to the storage API.

- **storage.local** data is stored locally and cleared when extension is removed.

- **storage.session** holds data in memory for the duration of a browser session.

In https://github.com/penumbra-zone/web/pull/38, we implement secure password-based encryption and decryption using PBKDF2 and AES-GCM, as well as mnemonic phrase generation and validation.

1. **PBKDF2 algorithm**: key derivation function with SHA-512 key stretching and 210,000 iterations to hamper brute force, dictionary attacks, and precomputed attacks (rainbow tables) attacks.
2. **AES-GCM** symmetric encryption scheme, using a random nonce for each encryption operation during wallet initialization.
3. **SHA-256** hash of the derived key material.

Currently, the key material is stored only in the extension's session storage upon login and is correctly cleared when the extension is locked. This key material is used to unseal the encrypted seed phrase ciphertext stored in local state storage and generate the associated spend key.

#### <ins>Remediations</ins>

While this behavior is correct and expected, there are additional potential privacy-related leaks to consider:

1. The full viewing key material is generated from the spend key, and the plaintext JSON of the full viewing key is stored in local state storage. When the extension is locked, a potential attacker with access to the console can still execute `chrome.storage.local.get().then(console.log)` and access the full viewing key in the clear. To mitigate this, we should:

   - Ensure that all access to sensitive data in state storage is gated behind an authentication check to ensure user has logged in,
   - Consider storing the encrypted full viewing key or not storing the full viewing key at all and deriving it from the spend key each time it is needed.

2. Require a password for the extension upon mainnet launch and warn users that setting an empty password is not advised.
