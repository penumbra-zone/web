import { useStore } from '../state';
import { encrypt } from 'penumbra-crypto-ts';

// Saves hashed password, uses that hash to encrypt the seed phrase
// and then saves that to session + local storage
export const useOnboardingSave = () => {
  const { setPassword } = useStore((state) => state.password);
  const { phrase } = useStore((state) => state.seedPhrase);
  const { addAccount } = useStore((state) => state.accounts);

  return (plaintextPassword: string) => {
    const hashedPassword = setPassword(plaintextPassword);
    const encryptedSeedPhrase = encrypt(phrase.join(' '), hashedPassword);
    addAccount({ label: 'Account #1', encryptedSeedPhrase });
  };
};
