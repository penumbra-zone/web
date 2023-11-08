export const BellIcon = ({ stroke = '#BDB8B8' }: { stroke?: string }) => {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30' fill='none'>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M15 3.75C19.1421 3.75 22.5 7.1078 22.5 11.2499C22.5 13.6414 22.5 16.0427 22.5 17.5C22.5 21.25 25 22.5 25 22.5L5 22.5C5 22.5 7.5 21.25 7.5 17.5C7.5 16.0427 7.5 13.6414 7.5 11.2499C7.5 7.1078 10.8579 3.75 15 3.75V3.75Z'
        stroke={stroke}
        strokeLinejoin='round'
      />
      <path
        d='M12.5 22.5C12.5 23.8807 13.6193 25 15 25C16.3807 25 17.5 23.8807 17.5 22.5'
        stroke={stroke}
      />
    </svg>
  );
};
