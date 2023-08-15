import SHA256 from 'crypto-js/sha256';
import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';

const STRETCH_ROUNDS = 5000;

// In cryptography, key stretching techniques are used to make brute-force attacks more difficult.
// The idea is to "stretch" the key (or in this case, the password) by applying a computationally intensive
// operation to it multiple times. This makes each attempt to guess the password more time-consuming,
// which in turn makes brute-force attacks less feasible.
export const repeatedHash = (message: string) => {
  let hash = SHA256(message);
  for (let i = 0; i < STRETCH_ROUNDS; i++) {
    hash = SHA256(hash.toString());
  }
  return hash.toString();
};

export const encrypt = (message: string, key: string) => {
  return AES.encrypt(message, key).toString();
};

export const decrypt = (ciphertext: string, key: string) => {
  const decrypted = AES.decrypt(ciphertext, key);
  return decrypted.toString(Utf8);
};
