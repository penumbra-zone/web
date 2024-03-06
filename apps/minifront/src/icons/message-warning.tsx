export const MessageWarningIcon = ({ stroke = '#BDB8B8' }: { stroke?: string }) => {
  return (
    <svg width='30' height='30' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path d='M12 7V11' stroke={stroke} strokeLinecap='round' />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M12 15C12.5523 15 13 14.5523 13 14C13 13.4477 12.5523 13 12 13C11.4477 13 11 13.4477 11 14C11 14.5523 11.4477 15 12 15Z'
        fill={stroke}
      />
      <path d='M21 4V17H13L7 21V17H3V4H21Z' stroke={stroke} strokeLinejoin='round' />
    </svg>
  );
};
