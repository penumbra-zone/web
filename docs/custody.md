# Custody

### Password

new API
in-memory password key in zustand
await session.set('passwordKey', key);
await local.set('passwordKeyPrint', keyPrint.toJson());

When setting up for the first time, you'll need to set a password.

This password is hashed via `PBKDF2`, see [keyStretchingHash() function](../packages/crypto/src/encryption.ts).
It utilizes a pseudorandom function along with a salt value and iteration. The use of a salt provides protection against pre-computed attacks such as rainbow tables, and the iteration count slows down brute-force attacks.

The password `Key` (private key material) is stored in `chrome.storage.session` used for deriving spending keys for wallets later.

The password `KeyPrint` (public hash/salt) is stored in `chrome.storage.local` to later validate logins when session storage is wiped.

### New wallet

Upon importing or generating a new seed phrase, it is:

- Encrypted using `AES-GCM`, see [encrypt() function](../packages/crypto/src/encryption.ts)
- `Box` (nonce/ciphertext) is stored in `chrome.storage.local` for later decryption
