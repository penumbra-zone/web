import { useStore } from '../state';
import { passwordSelector } from '../state/password';
import { generateSelector } from '../state/seed-phrase/generate';
import { importSelector } from '../state/seed-phrase/import';
import { walletsSelector } from '../state/wallets';

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

    await addWallet({ label: 'Wallet #1', seedPhrase });
    void chrome.runtime.sendMessage('PENUMBRA_SYNC_BLOCKS');
  };
};
