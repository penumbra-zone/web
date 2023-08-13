import { AllSlices, SliceCreatorWithStorage } from './index';
import { decrypt, encrypt, repeatedHash } from '../utils/encryption';

export interface AccountsSlice {
  hashedPassword: string | undefined;
  encryptedSeedPhrase: string | undefined;
  setPassword: (password: string) => void;
  clearPassword: () => void;
  setSeedPhrase: (password: string, seedPhrase: string) => void;
  isPassword: (password: string) => boolean;
}

export const createAccountsSlice: SliceCreatorWithStorage<AccountsSlice> =
  (session, local) => (set, get) => {
    return {
      hashedPassword: undefined,
      encryptedSeedPhrase: undefined,
      setPassword: (password) => {
        const hashedPassword = repeatedHash(password);
        set((state) => {
          state.accounts.hashedPassword = hashedPassword;
        });
        void session.set('hashedPassword', hashedPassword);
      },
      clearPassword: () => {
        set((state) => {
          state.accounts.hashedPassword = undefined;
        });
        void session.remove('hashedPassword');
      },
      setSeedPhrase: (password, seedPhrase) => {
        const encryptedSeedPhrase = encrypt(seedPhrase, repeatedHash(password));
        set((state) => {
          state.accounts.encryptedSeedPhrase = encryptedSeedPhrase;
        });
        void local.set('encryptedSeedPhrase', encryptedSeedPhrase);
      },
      isPassword: (password) => {
        try {
          decrypt(get().accounts.encryptedSeedPhrase!, repeatedHash(password));
          return true; // The above decrypted without error ✅
        } catch {
          return false; // invalid password ❌
        }
      },
    };
  };

export const passwordStoredSelector = (state: AllSlices) => Boolean(state.accounts.hashedPassword);
