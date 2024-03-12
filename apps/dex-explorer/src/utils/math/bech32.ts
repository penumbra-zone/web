import { bech32m } from "bech32";
import { uint8ArrayToBase64, base64ToUint8Array } from "./base64";

export const innerToBech32Address = (inner: string, prefix: string): string => {
  return bech32m.encode(prefix, bech32m.toWords(base64ToUint8Array(inner)));
};

export const bech32ToInner = (addr: string): string => {
  const decodeAddress = bech32m.decode(
    addr,
  );
  return uint8ArrayToBase64(
    new Uint8Array(bech32m.fromWords(decodeAddress.words))
  );
};
