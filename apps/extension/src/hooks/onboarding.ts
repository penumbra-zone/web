import { useStore } from '../state';
import { encrypt, random128Bits } from 'penumbra-crypto-ts';
import { generateSelector } from '../state/seed-phrase/generate';
import { importSelector } from '../state/seed-phrase/import';
import { passwordSelector } from '../state/password';
import { walletsSelector } from '../state/wallets';
import { sendSwMessage } from '../routes/service-worker/internal/sender';
import { InitializeMessage } from '../routes/service-worker/internal/initialize';
import { testnetConstants } from 'penumbra-constants';
import { generateSpendKey, getFullViewingKey } from 'penumbra-wasm-ts';

// Saves hashed password, uses that hash to encrypt the seed phrase
// and then saves that to session + local storage
export const useOnboardingSave = () => {
  const { setPassword } = useStore(passwordSelector);
  const { phrase: generatedPhrase } = useStore(generateSelector);
  const { phrase: importedPhrase } = useStore(importSelector);
  const { addWallet } = useStore(walletsSelector);

  return async (plaintextPassword: string) => {
    // Determine which routes it came through to get here
    const phrase = generatedPhrase.length ? generatedPhrase : importedPhrase;
    const phraseString = phrase.join(' ');

    const hashedPassword = await setPassword(plaintextPassword);
    const initializationVector = random128Bits();
    const encryptedSeedPhrase = await encrypt(
      phraseString,
      initializationVector,
      hashedPassword.key,
    );
    const spendKey = generateSpendKey(phraseString);
    const fullViewingKey = getFullViewingKey(spendKey);

    await addWallet({
      label: 'Wallet #1',
      encryptedSeedPhrase,
      fullViewingKey,
      initializationVector,
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
