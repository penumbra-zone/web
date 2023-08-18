import { useStore } from '../state';
import { encrypt } from 'penumbra-crypto-ts';

// Saves hashed password, uses that hash to encrypt the seed phrase
// and then saves that to session + local storage
export const useOnboardingSave = () => {
  const { setPassword } = useStore((state) => state.password);
  const { phrase: generatedPhrase } = useStore((state) => state.seedPhrase.generate);
  const { phrase: importedPhrase } = useStore((state) => state.seedPhrase.import);
  const { addAccount } = useStore((state) => state.accounts);

  return (plaintextPassword: string) => {
    const hashedPassword = setPassword(plaintextPassword);
    // Determine which routes it came through to get here
    const phrase = generatedPhrase.length ? generatedPhrase : importedPhrase;
    const encryptedSeedPhrase = encrypt(phrase.join(' '), hashedPassword);
    addAccount({ label: 'Account #1', encryptedSeedPhrase });
  };
};
