export interface ShortChartProps {
  sign: 'positive' | 'negative' | 'neutral';
}

export const ShortChart = ({ sign }: ShortChartProps) => {
  if (sign === 'positive') {
    return (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='58'
        height='34'
        viewBox='0 0 58 34'
        fill='none'
      >
        <path
          opacity='0.32'
          d='M27.142 16.6557L12.7666 18.6606C11.6787 18.8124 10.7011 19.4048 10.0631 20.2989L1 33H57V4.25424L45.0452 1.51816C43.6453 1.19777 42.1811 1.65241 41.2089 2.70935L29.5335 15.4021C28.9057 16.0845 28.0604 16.5277 27.142 16.6557Z'
          fill='url(#short-chart-gradient)'
        />
        <path
          d='M57 4.25424L45.0452 1.51816C43.6453 1.19777 42.1811 1.65241 41.2089 2.70935L29.5335 15.4021C28.9057 16.0845 28.0604 16.5277 27.142 16.6557L12.7666 18.6606C11.6787 18.8124 10.7011 19.4048 10.0631 20.2989L1 33'
          stroke='#55D383'
          strokeLinecap='round'
        />
        <defs>
          <linearGradient
            id='short-chart-gradient'
            x1='29'
            y1='33'
            x2='29'
            y2='1'
            gradientUnits='userSpaceOnUse'
          >
            <stop stopColor='#1C793F' stopOpacity='0' />
            <stop offset='1' stopColor='#1C793F' />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='58' height='32' viewBox='0 0 58 32' fill='none'>
      <path
        opacity='0.32'
        d='M1 30.9044L12.6764 25.3016C13.5001 24.9064 14.1637 24.2411 14.5568 23.4164L18.2425 15.6841C18.7342 14.6526 19.6436 13.8806 20.7412 13.5629L32.0101 10.3015L35.4215 6.28357C37.5833 3.73746 41.7289 4.80552 42.3913 8.07922L45.9773 25.8024C46.5597 28.6811 49.9425 29.9714 52.2941 28.2118L57 24.6909V32H1V30.9044Z'
        fill='url(#short-chart-red-gradient)'
      />
      <path
        d='M57 24.6909L52.2941 28.2118C49.9425 29.9714 46.5597 28.6811 45.9773 25.8024L42.3913 8.07922C41.7289 4.80552 37.5833 3.73746 35.4215 6.28357L32.7899 9.38303C32.2814 9.98204 31.6076 10.418 30.8528 10.6364L20.7412 13.5629C19.6436 13.8806 18.7342 14.6526 18.2425 15.6841L14.5568 23.4164C14.1637 24.2411 13.5001 24.9064 12.6764 25.3016L1 30.9044'
        stroke='#F17878'
        strokeLinecap='round'
      />
      <defs>
        <linearGradient
          id='short-chart-red-gradient'
          x1='29'
          y1='32'
          x2='29'
          y2='-2.18182'
          gradientUnits='userSpaceOnUse'
        >
          <stop stopColor='#AF2626' stopOpacity='0' />
          <stop offset='1' stopColor='#AF2626' />
        </linearGradient>
      </defs>
    </svg>
  );
};
