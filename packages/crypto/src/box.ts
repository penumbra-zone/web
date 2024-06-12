// Public, stored representation of Box
import { Base64Str, base64ToUint8Array, uint8ArrayToBase64 } from '@penumbra-zone/types/base64';

export interface BoxJson {
  nonce: Base64Str;
  cipherText: Base64Str;
}

// Represents the encrypted data
export class Box {
  constructor(
    readonly nonce: Uint8Array,
    readonly cipherText: Uint8Array,
  ) {}

  static fromJson(json: BoxJson): Box {
    return new Box(base64ToUint8Array(json.nonce), base64ToUint8Array(json.cipherText));
  }

  toJson(): BoxJson {
    return {
      nonce: uint8ArrayToBase64(this.nonce),
      cipherText: uint8ArrayToBase64(this.cipherText),
    };
  }
}
