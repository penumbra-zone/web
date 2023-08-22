import { EyeClosedIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { useMemo, useState } from 'react';
import { Input, InputProps } from 'ui/components';
import { cn } from 'ui/lib/utils';

interface Validation {
  checkFn: (txt: string) => boolean;
  type: 'warn' | 'error'; // corresponds to red or yellow
  error: string;
}

interface PasswordInputProps {
  passwordValue: string;
  label: string;
  validations: Validation[];
  onChange: InputProps['onChange'];
}

export const PasswordInput = ({
  passwordValue,
  label,
  validations,
  onChange,
}: PasswordInputProps) => {
  const [reveal, setReveal] = useState(false);

  const validationResult = useMemo(() => {
    const validation = validations.map(i => ({
      check: i.checkFn(passwordValue),
      variant: i.type,
      error: i.error,
    }));

    const error = validation.find(i => i.variant === 'error' && i.check);
    if (error) return error;

    const warn = validation.find(i => i.variant === 'warn' && i.check);
    if (warn) return warn;

    return null;
  }, [validations, passwordValue]);

  return (
    <div className='flex flex-col items-center justify-center gap-2'>
      <div className='flex gap-2 self-start'>
        <div>{label}</div>
        {validationResult ? (
          <div
            className={cn(
              'italic',
              validationResult.variant === 'warn' ? 'text-yellow-300' : 'text-red-400',
            )}
          >
            {validationResult.error}
          </div>
        ) : null}
      </div>
      <div className='relative w-full'>
        <div className='absolute inset-y-0 right-4 flex cursor-pointer items-center'>
          {reveal ? (
            <EyeOpenIcon onClick={() => setReveal(false)} />
          ) : (
            <EyeClosedIcon onClick={() => setReveal(true)} className='text-gray-500' />
          )}
        </div>
        <Input
          type={reveal ? 'text' : 'password'}
          variant={validationResult?.variant ?? 'default'}
          value={passwordValue}
          onChange={onChange}
        />
      </div>
    </div>
  );
};
