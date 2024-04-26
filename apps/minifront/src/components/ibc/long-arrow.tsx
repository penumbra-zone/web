interface LongArrowIconProps {
  className?: string;
  direction: 'left' | 'right';
}

export const LongArrowIcon = ({ className, direction }: LongArrowIconProps) => {
  const rotationStyle = {
    transform: direction === 'right' ? 'rotate(0deg)' : 'rotate(180deg)',
  };

  return (
    <svg
      width='90'
      height='15'
      viewBox='0 0 90 15'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={className}
      style={rotationStyle}
    >
      <path
        d='M1 7.5H83.5M83.5 7.5L80 4M83.5 7.5L80 11'
        stroke='currentColor'
        strokeWidth='1.5'
        fill='none'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
};
