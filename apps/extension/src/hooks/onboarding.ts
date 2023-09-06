import { useStore } from '../state';
import { encrypt } from 'penumbra-crypto-ts';
import { generateSelector } from '../state/seed-phrase/generate';
import { importSelector } from '../state/seed-phrase/import';
import { passwordSelector } from '../state/password';
import { accountsSelector } from '../state/accounts';

// Saves hashed password, uses that hash to encrypt the seed phrase
// and then saves that to session + local storage
export const useOnboardingSave = () => {
  const { setPassword } = useStore(passwordSelector);
  const { phrase: generatedPhrase } = useStore(generateSelector);
  const { phrase: importedPhrase } = useStore(importSelector);
  const { addAccount } = useStore(accountsSelector);

  return async (plaintextPassword: string) => {
    const hashedPassword = setPassword(plaintextPassword);
    // Determine which routes it came through to get here
    const phrase = generatedPhrase.length ? generatedPhrase : importedPhrase;
    const encryptedSeedPhrase = encrypt(phrase.join(' '), hashedPassword);
    await addAccount({ label: 'Account #1', encryptedSeedPhrase });
  };
};
