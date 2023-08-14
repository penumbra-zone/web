import { Button } from '@ui/components/ui/button';
import { useStore } from '../../state';

export const PageIndex = () => {
  const { hashedPassword, setPassword } = useStore((state) => state.password);
  const { addAccount, all } = useStore((state) => state.accounts);
  return (
    <>
      <h1 className='bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-5xl font-extrabold text-transparent'>
        Welcome to Penumbra
      </h1>

      <div>
        <h2>hashedPassword: {hashedPassword}</h2>
        <Button
          onClick={() => {
            setPassword('password123');
          }}
        >
          Set hashedPassword
        </Button>

        <h2>Accounts: {JSON.stringify(all)}</h2>
        <Button
          onClick={() => {
            addAccount({
              label: 'account xyz',
              encryptedSeedPhrase: 'cat dog mouse 2342342341342',
            });
          }}
        >
          Add account
        </Button>
      </div>
    </>
  );
};
