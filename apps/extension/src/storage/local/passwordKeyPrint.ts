import { KeyPrint, KeyPrintJson } from '@penumbra-zone/crypto-web/encryption';

export const passwordKeyPrint = async (set?: KeyPrint): Promise<KeyPrint> => {
  if (set != null)
    await chrome.storage.local.set({ passwordKeyPrint: JSON.stringify(set.toJson()) });

  const { passwordKeyPrint } = await chrome.storage.local.get('passwordKeyPrint');
  if (typeof passwordKeyPrint !== 'string') throw TypeError();

  return KeyPrint.fromJson(JSON.parse(passwordKeyPrint) as KeyPrintJson);
};
