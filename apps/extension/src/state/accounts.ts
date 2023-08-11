import { SliceCreator } from './index';
import { decrypt, encrypt, repeatedHash } from '../utils/encryption';

export interface AccountsSlice {
  hashedPassword: string | undefined;
  encryptedSeedPhrase: string | undefined;
  setPassword: (password: string) => void;
  setSeedPhrase: (password: string, seedPhrase: string) => void;
  isPassword: (password: string) => boolean;
}

export const createAccountsSlice: SliceCreator<AccountsSlice> = (set, get) => ({
  hashedPassword: undefined,
  encryptedSeedPhrase: undefined,
  setPassword: (password) => {
    set(() => ({ hashedPassword: repeatedHash(password) }));
  },
  setSeedPhrase: (password, seedPhrase) => {
    const encryptedSeedPhrase = encrypt(seedPhrase, repeatedHash(password));
    set(() => ({ encryptedSeedPhrase }));
  },
  isPassword: (password) => {
    try {
      decrypt(get().encryptedSeedPhrase!, repeatedHash(password));
      return true; // The above decrypted without error ✅
    } catch {
      return false; // invalid password ❌
    }
  },
});
