import { Base64Str, base64ToUint8Array, uint8ArrayToBase64 } from 'penumbra-types';
import { Box } from 'penumbra-types/src/box';

/**
 * ==== Internal ====
 * Under-the-hood inner workings of hashing/encryption
 */

// Hash a password with PBKDF2 using a provided salt
// Meant to hinder brute force or dictionary attacks
const keyStretchingHash = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
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
      salt,
      iterations: 210_000,
      hash: 'SHA-512',
    },
    importedKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt'],
  );
};

// Encrypt a message using AES-GCM
const encrypt = async (message: string, nonce: Uint8Array, key: CryptoKey): Promise<Uint8Array> => {
  const enc = new TextEncoder();
  const buffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce },
    key,
    enc.encode(message),
  );
  return new Uint8Array(buffer);
};

// Decrypt a ciphertext using AES-GCM
const decrypt = async (
  ciphertext: Uint8Array,
  nonce: Uint8Array, // You need to provide both the same nonce & key used for encryption
  key: CryptoKey,
): Promise<string> => {
  const dec = new TextDecoder();
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: nonce }, key, ciphertext);
  return dec.decode(decrypted);
};

/**
 * ==== External ====
 */

// Public, stored representation of KeyPrint
export interface KeyPrintJson {
  hash: Base64Str;
  salt: Base64Str;
}

// Used to recreate the original key material
export class KeyPrint {
  constructor(
    readonly hash: Uint8Array,
    readonly salt: Uint8Array,
  ) {}

  static fromJson(json: KeyPrintJson): KeyPrint {
    return new KeyPrint(base64ToUint8Array(json.hash), base64ToUint8Array(json.salt));
  }

  toJson(): KeyPrintJson {
    return {
      hash: uint8ArrayToBase64(this.hash),
      salt: uint8ArrayToBase64(this.salt),
    };
  }
}

export const uintArraysEqual = (a: Uint8Array, b: Uint8Array): boolean => {
  return a.length === b.length && a.every((num, i) => b[i] === num);
};

export interface KeyJson {
  _inner: JsonWebKey;
}

// Private key used to encrypt & decrypt messages. Do not expose publicly.
export class Key {
  private constructor(private readonly key: CryptoKey) {}

  // Create a new Key instance from a password. Do not store the Key, only KeyPrint.
  static async create(password: string): Promise<{ key: Key; keyPrint: KeyPrint }> {
    const salt = crypto.getRandomValues(new Uint8Array(16)); // 128 bit
    const key = await keyStretchingHash(password, salt);
    const buffer = await crypto.subtle.exportKey('raw', key);

    // A second, fast hash to hide the result of the former
    const hashedKey = await crypto.subtle.digest('SHA-256', buffer);

    return {
      key: new Key(key),
      keyPrint: new KeyPrint(new Uint8Array(hashedKey), salt),
    };
  }

  // Takes a KeyPrint + password to recreate the original Key
  static async recreate(password: string, print: KeyPrint): Promise<Key | null> {
    const key = await keyStretchingHash(password, print.salt);
    const buffer = await crypto.subtle.exportKey('raw', key);
    const hashedKey = await crypto.subtle.digest('SHA-256', buffer);

    if (!uintArraysEqual(print.hash, new Uint8Array(hashedKey))) return null;
    return new Key(key);
  }

  static async fromJson(jwk: KeyJson): Promise<Key> {
    const key = await crypto.subtle.importKey(
      'jwk',
      jwk._inner,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt'],
    );
    return new Key(key);
  }

  // Encrypts message. Box can be publicly stored.
  async seal(message: string): Promise<Box> {
    const nonce = crypto.getRandomValues(new Uint8Array(12)); // AES uses twelve bytes
    const cipherText = await encrypt(message, nonce, this.key);
    return new Box(nonce, cipherText);
  }

  // Attempts to decrypt Box into message. If failure, returns `null`.
  async unseal(box: Box): Promise<string | null> {
    try {
      return await decrypt(box.cipherText, box.nonce, this.key);
    } catch (e) {
      console.log(e);
      if (e instanceof TypeError) {
        return null;
      }

      if (e instanceof DOMException) {
        if (e.name === 'OperationError') {
          return null;
        }
      }

      throw e;
    }
  }

  async toJson(): Promise<KeyJson> {
    return { _inner: await crypto.subtle.exportKey('jwk', this.key) };
  }
}
