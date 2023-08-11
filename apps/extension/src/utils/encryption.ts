import SHA256 from 'crypto-js/sha256';
import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';

const STRETCH_ROUNDS = 5000;

// TODO: Write tests for this

// In cryptography, key stretching techniques are used to make brute-force attacks more difficult.
// The idea is to "stretch" the key (or in this case, the password) by applying a computationally intensive
// operation to it multiple times. This makes each attempt to guess the password more time-consuming,
// which in turn makes brute-force attacks less feasible.
function keyStretch(message: string) {
  let hash = SHA256(message);
  for (let i = 0; i < STRETCH_ROUNDS; i++) {
    hash = SHA256(hash);
  }
  return hash;
}

export function encrypt(message: string, key: string) {
  const hashedKey = keyStretch(key);
  return AES.encrypt(message, hashedKey).toString();
}

export function decrypt(ciphertext: string, key: string) {
  const hashedKey = keyStretch(key);
  const decrypted = AES.decrypt(ciphertext, hashedKey);
  return decrypted.toString(Utf8);
}
