import { AllSlices, SliceCreator } from './index';
import { ExtensionStorage } from '../storage/base';
import { SessionStorageState } from '../storage/session';
import { LocalStorageState } from '../storage/local';
import { hashPassword, isPassword, random128Bits } from 'penumbra-crypto-ts';

// Documentation in /docs/custody.md

export interface HashedPassword {
  key: CryptoKey;
  salt: Uint8Array;
}

export interface PasswordSlice {
  hashedPassword: HashedPassword | undefined;
  setPassword: (password: string) => Promise<HashedPassword>;
  isPassword: (password: string) => Promise<boolean>;
  clearSessionPassword: () => void;
}

export const createPasswordSlice =
  (
    session: ExtensionStorage<SessionStorageState>,
    local: ExtensionStorage<LocalStorageState>,
  ): SliceCreator<PasswordSlice> =>
  (set, get) => {
    return {
      hashedPassword: undefined,
      setPassword: async password => {
        const salt = random128Bits();
        const key = await hashPassword(password, salt);
        const hashedPassword = { key, salt };
        set(state => {
          state.password.hashedPassword = hashedPassword;
        });
        void session.set('hashedPassword', hashedPassword);
        void local.set('passwordSalt', salt); // Salt must be persisted in local to later validate logins
        return hashedPassword;
      },
      clearSessionPassword: () => {
        set(state => {
          state.password.hashedPassword = undefined;
        });
        void session.remove('hashedPassword');
      },
      isPassword: async attempt => {
        const wallets = await local.get('wallets');
        if (!wallets.length) throw new Error('No wallets to determine password validity');

        const salt = get().password.hashedPassword?.salt;
        if (!salt) throw new Error('Password salt not in storage');

        const { encryptedSeedPhrase, initializationVector } = wallets[0]!; // All seed phrases encrypted by password
        return isPassword(attempt, salt, encryptedSeedPhrase, initializationVector);
      },
    };
  };

export const passwordSelector = (state: AllSlices) => state.password;
