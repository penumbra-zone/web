import { AllSlices, SliceCreator } from './index';
import { ExtensionStorage } from '../storage/base';
import { SessionStorageState } from '../storage/session';
import { LocalStorageState } from '../storage/local';
import { repeatedHash } from 'penumbra-crypto-ts';

export interface PasswordSlice {
  hashedPassword: string | undefined;
  isCorrectPassword: boolean;
  setPassword: (password: string) => string;
  setCorrectPassword: () => void;
  clearPassword: () => void;
  isPassword: (password: string) => Promise<boolean>;
  clearSessionPassword: () => void;
  isUnlock: (password: string) => Promise<boolean>;
}

export const createPasswordSlice =
  (
    session: ExtensionStorage<SessionStorageState>,
    local: ExtensionStorage<LocalStorageState>,
  ): SliceCreator<PasswordSlice> =>
  (set, get) => {
    return {
      hashedPassword: undefined,
      isCorrectPassword: true,
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
      setCorrectPassword: () => {
        set(state => {
          state.password.isCorrectPassword = true;
        });
      },
      isPassword: async password => {
        const locallyStoredPassword = await local.get('hashedPassword');
        return locallyStoredPassword === repeatedHash(password);
      },
      isUnlock: async password => {
        const { isPassword, setPassword } = get().password;

        const isCheckedPassword = await isPassword(password);

        if (isCheckedPassword) {
          setPassword(password);
          set(state => {
            state.password.isCorrectPassword = true;
          });
        } else {
          set(state => {
            state.password.isCorrectPassword = false;
          });
        }
        return isCheckedPassword;
      },
    };
  };

export const passwordSelector = (state: AllSlices) => state.password;
