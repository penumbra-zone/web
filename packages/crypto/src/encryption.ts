// Salts & initialization vectors should be stored
export const random128Bits = (): Uint8Array => {
  return crypto.getRandomValues(new Uint8Array(16)); // 128 bits
};

export const hashPassword = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
  const enc = new TextEncoder();
  const importedKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey'],
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      // Recommended config by: https://github.com/OWASP/CheatSheetSeries/blob/master/cheatsheets/Password_Storage_Cheat_Sheet.md
      iterations: 210000,
      hash: 'SHA-512',
    },
    importedKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
};

export const isPassword = async (
  password: string,
  salt: Uint8Array,
  encryptedSeedPhrase: ArrayBuffer,
  initializationVector: Uint8Array,
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
  initializationVector: Uint8Array,
  key: CryptoKey,
): Promise<ArrayBuffer> => {
  const enc = new TextEncoder();
  return crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: initializationVector },
    key,
    enc.encode(message),
  );
};

export const decrypt = async (
  ciphertext: ArrayBuffer,
  initializationVector: Uint8Array, // You need to provide both the same iv & key used for encryption
  key: CryptoKey,
): Promise<string> => {
  const dec = new TextDecoder();
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: initializationVector },
    key,
    ciphertext,
  );
  return dec.decode(decrypted);
};
