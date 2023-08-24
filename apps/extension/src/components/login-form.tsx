import { Button, InputProps } from 'ui/components';
import { PasswordInput } from './password-input';
import { useStore } from '../state';
import { passwordSelector } from '../state/password';
import { useState } from 'react';
import { usePageNav } from '../utils/navigate';
import { PagePath } from '../routes/page/paths';

export const LoginForm = () => {
  const navigate = usePageNav();

  const { setPassword, isPassword } = useStore(passwordSelector);
  const [input, setInputValue] = useState('');
  const [enteredIncorrect, setEnteredIncorrect] = useState(false);

  const handleUnlock = () => {
    void (async function () {
      if (await isPassword(input)) {
        setPassword(input); // saves to session state
        navigate(PagePath.INDEX);
      } else {
        setEnteredIncorrect(true);
      }
    })();
  };

  const handleChangePassword: InputProps['onChange'] = e => {
    setInputValue(e.target.value);
    setEnteredIncorrect(false);
  };
  
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        handleUnlock();
      }}
      className='grid gap-4'
    >
      <PasswordInput
        passwordValue={input}
        label='Password'
        onChange={handleChangePassword}
        validations={[
          {
            type: 'error',
            error: 'wrong password',
            checkFn: (txt: string) => Boolean(txt) && enteredIncorrect,
          },
        ]}
      />
      <Button
        variant='gradient'
        disabled={!input || enteredIncorrect}
        onClick={handleUnlock}
        type='button'
      >
        Unlock
      </Button>
    </form>
  );
};
