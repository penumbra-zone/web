import { Base64Str, base64ToUint8Array, uint8ArrayToBase64 } from 'penumbra-types';

// Salts & initialization vectors should be stored
export const randomBase64str = (): Base64Str => {
  const uintArr = crypto.getRandomValues(new Uint8Array(16)); // 128 bits
  return uint8ArrayToBase64(uintArr);
};

export const hashPassword = async (password: string, salt: Base64Str): Promise<JsonWebKey> => {
  const enc = new TextEncoder();
  const importedKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey'],
  );

  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: base64ToUint8Array(salt),
      iterations: 210_000,
      hash: 'SHA-512',
    },
    importedKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt'],
  );

  return crypto.subtle.exportKey('jwk', derivedKey);
};

export const isPassword = async (
  password: string,
  salt: Base64Str,
  encryptedSeedPhrase: Base64Str,
  initializationVector: Base64Str,
): Promise<boolean> => {
  try {
    const key = await hashPassword(password, salt);
    await decrypt(encryptedSeedPhrase, initializationVector, key);
    return true;
  } catch (error) {
    return false;
  }
};

export const encrypt = async (
  message: string,
  initializationVector: Base64Str,
  jwkKey: JsonWebKey,
): Promise<Base64Str> => {
  const key = await crypto.subtle.importKey(
    'jwk',
    jwkKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );

  const enc = new TextEncoder();
  const buffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: base64ToUint8Array(initializationVector) },
    key,
    enc.encode(message),
  );
  return uint8ArrayToBase64(new Uint8Array(buffer));
};

export const decrypt = async (
  ciphertext: Base64Str,
  initializationVector: Base64Str, // You need to provide both the same iv & key used for encryption
  jwkKey: JsonWebKey,
): Promise<string> => {
  // Import the key
  const key = await crypto.subtle.importKey(
    'jwk',
    jwkKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );

  const dec = new TextDecoder();
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: base64ToUint8Array(initializationVector) },
    key,
    base64ToUint8Array(ciphertext),
  );
  return dec.decode(decrypted);
};
