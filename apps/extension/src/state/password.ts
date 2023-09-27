import { AllSlices, SliceCreator } from './index';
import { ExtensionStorage } from '../storage/base';
import { SessionStorageState } from '../storage/session';
import { LocalStorageState } from '../storage/local';
import { Box, Key, KeyPrint } from 'penumbra-crypto-ts';

// Documentation in /docs/custody.md

export interface PasswordSlice {
  key: Key | undefined;
  setPassword: (password: string) => Promise<void>;
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
      key: undefined,
      setPassword: async password => {
        const { key, keyPrint } = await Key.create(password);

        set(state => (state.password.key = key));
        // await session.set('passwordKey', key);
        await local.set('passwordKeyPrint', keyPrint.toJson());
      },
      clearSessionPassword: () => {
        set(state => (state.password.key = undefined));
        void session.remove('passwordKey');
      },
      isPassword: async attempt => {
        const wallets = await local.get('wallets');
        if (!wallets.length) throw new Error('No wallets to determine password validity');
        const { encryptedSeedPhrase } = wallets[0]!; // All seed phrases encrypted by password

        const keyPrintJson = await local.get('passwordKeyPrint');
        if (!keyPrintJson) throw new Error('Password KeyPrint not in storage');

        const key = await Key.recreate(attempt, KeyPrint.fromJson(keyPrintJson));
        const result = await key?.unseal(Box.fromJson(encryptedSeedPhrase));
        return Boolean(result);
      },
    };
  };

export const passwordSelector = (state: AllSlices) => state.password;
