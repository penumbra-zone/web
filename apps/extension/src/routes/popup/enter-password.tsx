import { useStore } from '../../state';
import { useState } from 'react';
import { PopupPath } from './paths';
import { usePopupNav } from '../../utils/navigate';
import { passwordSelector } from '../../state/password';

export const EnterPassword = () => {
  const navigate = usePopupNav();
  const { isPassword, setPassword } = useStore(passwordSelector);
  const [inputTx, setInputTxt] = useState('');
  return (
    <div>
      <form
        onSubmit={e => {
          e.preventDefault();
          void (async function () {
            if (await isPassword(inputTx)) {
              setPassword(inputTx);
              navigate(PopupPath.INDEX);
            }
          })();
        }}
      >
        <label>
          Enter your password
          <input
            type='text'
            value={inputTx}
            onChange={e => {
              setInputTxt(e.target.value);
            }}
          />
        </label>
        <input type='submit' value='Submit' />
      </form>
    </div>
  );
};
