import { useStore } from '../state';
import { passwordSelector } from '../state/password';
import { generateSelector } from '../state/seed-phrase/generate';
import { importSelector } from '../state/seed-phrase/import';
import { walletsSelector } from '../state/wallets';
import { sendSwMessage } from '../routes/service-worker/internal/sender';
import { InitializeMessage } from '../routes/service-worker/internal/initialize';
import { testnetConstants } from 'penumbra-constants';

// Saves hashed password, uses that hash to encrypt the seed phrase
// and then saves that to session + local storage
export const useOnboardingSave = () => {
  const { setPassword } = useStore(passwordSelector);
  const { phrase: generatedPhrase } = useStore(generateSelector);
  const { phrase: importedPhrase } = useStore(importSelector);
  const { addWallet } = useStore(walletsSelector);

  return async (plaintextPassword: string) => {
    // Determine which routes it came through to get here
    const seedPhrase = generatedPhrase.length ? generatedPhrase : importedPhrase;
    await setPassword(plaintextPassword);

    const { fullViewingKey } = await addWallet({
      label: 'Wallet #1',
      seedPhrase,
    });
    void sendSwMessage<InitializeMessage>({
      type: 'INITIALIZE',
      data: {
        grpcEndpoint: testnetConstants.grpcEndpoint,
        indexedDbVersion: testnetConstants.indexedDbVersion,
        fullViewingKey,
      },
    });
  };
};
