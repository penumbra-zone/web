import { cn } from '@penumbra-zone/ui/utils';

export const SwapIcon = ({
  stroke = '#BDB8B8',
  className,
}: {
  stroke?: string;
  className?: string;
}) => {
  return (
    <svg
      className={cn('h-5 w-5', className)}
      viewBox='0 0 20 20'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M13.3334 3.33337L15.8334 5.83337L13.3334 8.33337'
        stroke={stroke}
        strokeLinecap='round'
      />
      <path d='M3.33337 5.83341L15 5.83342' stroke={stroke} strokeLinecap='round' />
      <path
        d='M5.83337 16.6666L3.33338 14.1666L5.83338 11.6666'
        stroke={stroke}
        strokeLinecap='round'
      />
      <path d='M15.8334 14.1666L4.16671 14.1666' stroke={stroke} strokeLinecap='round' />
    </svg>
  );
};
