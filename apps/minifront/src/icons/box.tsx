import { cn } from '@penumbra-zone/ui/lib/utils';

export const BoxIcon = ({
  stroke = '#BDB8B8',
  className,
}: {
  stroke?: string;
  className?: string;
}) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 20 20'
      fill='none'
      className={cn('w-5 h-5', className)}
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M10 1.66663L17.5 5.83329V14.1666L10 18.3333L2.5 14.1666V5.83329L10 1.66663Z'
        stroke={stroke}
        strokeLinejoin='round'
      />
      <path d='M2.5 5.83337L10 10L17.5 5.83337' stroke={stroke} />
      <path d='M9.99996 10V18.3333' stroke={stroke} />
    </svg>
  );
};
