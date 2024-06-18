import { cn } from '@repo/ui/lib/utils';

export const DragHandleDotsIcon = ({
  stroke = '#BDB8B8',
  className,
}: {
  stroke?: string;
  className?: string;
}) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      className={cn('w-5 h-5', className)}
      viewBox='0 0 24 24'
      fill='none'
    >
      <circle cx='6' cy='6' r='1' stroke={stroke} strokeLinecap='round' />
      <circle cx='12' cy='6' r='1' stroke={stroke} strokeLinecap='round' />
      <circle cx='18' cy='6' r='1' stroke={stroke} strokeLinecap='round' />
      <circle cx='6' cy='12' r='1' stroke={stroke} strokeLinecap='round' />
      <circle cx='12' cy='12' r='1' stroke={stroke} strokeLinecap='round' />
      <circle cx='18' cy='12' r='1' stroke={stroke} strokeLinecap='round' />
      <circle cx='6' cy='18' r='1' stroke={stroke} strokeLinecap='round' />
      <circle cx='12' cy='18' r='1' stroke={stroke} strokeLinecap='round' />
      <circle cx='18' cy='18' r='1' stroke={stroke} strokeLinecap='round' />
    </svg>
  );
};
