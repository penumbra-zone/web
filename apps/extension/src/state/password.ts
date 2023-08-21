import { AllSlices, SliceCreator } from './index';
import { ExtensionStorage } from '../storage/base';
import { SessionStorageState } from '../storage/session';
import { LocalStorageState } from '../storage/local';
import { repeatedHash } from 'penumbra-crypto-ts';

export interface PasswordSlice {
  hashedPassword: string | undefined;
  setPassword: (password: string) => string;
  clearPassword: () => void;
  isPassword: (password: string) => Promise<boolean>;
  clearSessionPassword: () => void;
}

export const createPasswordSlice =
  (
    session: ExtensionStorage<SessionStorageState>,
    local: ExtensionStorage<LocalStorageState>,
  ): SliceCreator<PasswordSlice> =>
  set => {
    return {
      hashedPassword: undefined,
      setPassword: password => {
        const hashedPassword = repeatedHash(password);
        set(state => {
          state.password.hashedPassword = hashedPassword;
        });
        void session.set('hashedPassword', hashedPassword);
        void local.set('hashedPassword', hashedPassword);
        return hashedPassword;
      },
      clearPassword: () => {
        set(state => {
          state.password.hashedPassword = undefined;
        });
        void session.remove('hashedPassword');
        void local.remove('hashedPassword');
      },
      clearSessionPassword: () => {
        set(state => {
          state.password.hashedPassword = undefined;
        });
        void session.remove('hashedPassword');
      },

      isPassword: async password => {
        const locallyStoredPassword = await local.get('hashedPassword');
        return locallyStoredPassword === repeatedHash(password);
      },
    };
  };

export const passwordSelector = (state: AllSlices) => state.password;
