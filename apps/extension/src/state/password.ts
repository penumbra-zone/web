import { AllSlices, SliceCreator } from '.';
import { Key, KeyJson, KeyPrint } from '@penumbra-zone/crypto-web';
import { ExtensionStorage } from '@penumbra-zone/storage/src/chrome/base';
import { LocalStorageState } from '@penumbra-zone/storage/src/chrome/local';
import { SessionStorageState } from '@penumbra-zone/storage/src/chrome/session';

// Documentation in /docs/custody.md

export interface PasswordSlice {
  key: KeyJson | undefined; // Given we are using immer, the private class fields in `Key` clash with immer's copying mechanics
  setPassword: (password: string) => Promise<void>;
  isPassword: (password: string) => Promise<boolean>;
  clearSessionPassword: () => void;
  setSessionPassword: (password: string) => Promise<void>;
}

export const createPasswordSlice =
  (
    session: ExtensionStorage<Partial<SessionStorageState>>,
    local: ExtensionStorage<LocalStorageState>,
  ): SliceCreator<PasswordSlice> =>
  set => {
    return {
      key: undefined,
      setPassword: async password => {
        const { key, keyPrint } = await Key.create(password);
        const keyJson = await key.toJson();

        set(state => {
          state.password.key = keyJson;
        });
        await session.set('passwordKey', keyJson);
        await local.set('passwordKeyPrint', keyPrint.toJson());
      },
      setSessionPassword: async password => {
        const keyPrintJson = await local.get('passwordKeyPrint');
        if (!keyPrintJson) throw new Error('Password KeyPrint not in storage');

        const key = await Key.recreate(password, KeyPrint.fromJson(keyPrintJson));
        if (!key) throw new Error('Password does not match KeyPrint');

        const keyJson = await key.toJson();

        set(state => {
          state.password.key = keyJson;
        });

        await session.set('passwordKey', keyJson);
      },
      clearSessionPassword: () => {
        set(state => (state.password.key = undefined));
        void session.remove('passwordKey');
      },
      isPassword: async attempt => {
        const keyPrintJson = await local.get('passwordKeyPrint');
        if (!keyPrintJson) throw new Error('Password KeyPrint not in storage');

        const key = await Key.recreate(attempt, KeyPrint.fromJson(keyPrintJson));
        return Boolean(key);
      },
    };
  };

export const passwordSelector = (state: AllSlices) => state.password;
