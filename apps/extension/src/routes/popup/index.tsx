import { usePasswordCheck } from '../../hooks/password-redirect';

export const PopupIndex = () => {
  usePasswordCheck();

  return (
    <div>
      <h3>You&apos;re in! Password in storage.</h3>
    </div>
  );
};
