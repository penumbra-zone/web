import { Key, KeyJson } from '@penumbra-zone/crypto-web/encryption';

export const passwordKey = async (set?: Key) => {
  if (set != null)
    await chrome.storage.session.set({ passwordKey: JSON.stringify(await set.toJson()) });

  const { passwordKey } = await chrome.storage.session.get('passwordKey');
  if (typeof passwordKey === 'string') return Key.fromJson(JSON.parse(passwordKey) as KeyJson);

  throw new TypeError();
};
