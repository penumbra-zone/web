import { EyeClosedIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { useState } from 'react';
import { Input, InputProps } from 'ui/components';

interface IPasswordInputProps {
  value: string;
  label: string;
  isHelper: boolean;
  helper: string;
  onChange: InputProps['onChange'];
}

export const PasswordInput = ({
  value,
  isHelper,
  helper,
  label,
  onChange,
}: IPasswordInputProps) => {
  const [reveal, setReveal] = useState(false);

  return (
    <div className='flex flex-col items-center justify-center gap-2'>
      <div className='flex gap-2 self-start'>
        <div>{label}</div>
        <div className='italic text-yellow-300'>{isHelper && helper}</div>
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
          variant={!value.length ? 'default' : value.length >= 8 ? 'success' : 'warn'}
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );
};
