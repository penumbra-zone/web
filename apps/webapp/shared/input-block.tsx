import { Input } from 'ui';
import { cn } from 'ui/lib/utils';

interface InputBlockProps {
  label: string;
  placeholder: string;
  className?: string;
}

export const InputBlock = ({ label, placeholder, className }: InputBlockProps) => {
  return (
    <div
      className={cn(
        'bg-background px-4 pt-3 pb-4 rounded-lg border flex flex-col gap-1',
        className,
      )}
    >
      <p className='text-base font-bold'>{label}</p>
      <Input variant='transparent' placeholder={placeholder} />
    </div>
  );
};
