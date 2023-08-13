import { Button } from '@ui/components/ui/button';
import { useStore } from '../../state';

export const PageIndex = () => {
  const { hashedPassword, setPassword, clearPassword, encryptedSeedPhrase, setSeedPhrase } =
    useStore((state) => state.accounts);
  return (
    <>
      <h1 className='bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-5xl font-extrabold text-transparent'>
        Welcome to Penumbra
      </h1>

      <div>
        <h2>hashedPassword: {hashedPassword}</h2>
        <Button
          onClick={() => {
            setPassword(Math.random().toString());
          }}
        >
          Set hashedPassword
        </Button>
        <Button
          onClick={() => {
            clearPassword();
          }}
        >
          remove hashedPassword
        </Button>

        <h2>encryptedSeedPhrase: {encryptedSeedPhrase}</h2>
        <Button
          onClick={() => {
            setSeedPhrase('my_password_123', 'dog cat mouse');
          }}
        >
          Set encryptedSeedPhrase
        </Button>
      </div>
    </>
  );
};
