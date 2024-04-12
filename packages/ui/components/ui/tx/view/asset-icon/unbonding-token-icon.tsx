import { assetPatterns } from '@penumbra-zone/constants/src/assets';

const getFirstEightCharactersOfValidatorId = (displayDenom = ''): [string, string] => {
  const id = (assetPatterns.unbondingToken.capture(displayDenom)?.id ?? '').substring(0, 8);

  const firstFour = id.substring(0, 4);
  const lastFour = id.substring(4);

  return [firstFour, lastFour];
};

export const UnbondingTokenIcon = ({
  className,
  displayDenom,
}: {
  className?: string;
  displayDenom?: string;
}) => {
  const [firstFour, lastFour] = getFirstEightCharactersOfValidatorId(displayDenom);

  return (
    <svg
      id='unbonding'
      xmlns='http://www.w3.org/2000/svg'
      xmlnsXlink='http://www.w3.org/1999/xlink'
      viewBox='0 0 32 32'
      className={className}
    >
      <defs>
        <radialGradient
          id='logoGradient'
          cx='-475.62'
          cy='477.46'
          fx='-475.62'
          fy='477.46'
          r='1'
          gradientTransform='translate(8030.1 3047.46) rotate(-24.39) scale(12.71 -12.71)'
          gradientUnits='userSpaceOnUse'
        >
          <stop offset='0' stopColor='#f79036' />
          <stop offset='.6' stopColor='#f79036' />
          <stop offset='.88' stopColor='#96d5d1' />
          <stop offset='1' stopColor='#96d5d1' />
        </radialGradient>
      </defs>
      <rect id='background' width='32' height='32' fill='#000' strokeWidth='0' />
      <path
        id='logo'
        d='M21.04,4.16c-.87.31-1.73.71-2.55,1.09h0c-1.51.7-2.94,1.36-4.07,1.29h0c-.4-.02-.88-.08-1.44-.16h0c-2.12-.26-5.02-.63-6.54.61h0c-1.08.88-.91,2.97-.75,5h0c.12,1.52.25,3.08-.17,4.02h0c-.94,2.13-1.26,3.94-.95,5.39h0c.3,1.42,1.22,2.54,2.71,3.31h0c.84.44,1.62.62,2.44.81h0c1.2.28,2.44.58,3.99,1.71h0c.77.57,1.57.85,2.42.85h0c1.61,0,3.4-1.04,5.53-3.16h0c.77-.77,1.72-1.22,2.63-1.66h0c1.07-.51,2.18-1.04,3.03-2.09h0c.52-.64.65-1.33.4-2.09h0c-.22-.68-.7-1.36-1.21-2.08h0c-.56-.79-1.13-1.6-1.48-2.53h0c-.6-1.62-.49-2.26-.29-3.44h0c.13-.76.3-1.71.33-3.25h0c.04-1.76-.45-2.76-1.26-3.34h0c-.43-.31-.93-.51-1.55-.51h0c-.37,0-.78.07-1.24.24M11.78,21.76c-1.18-.87-2.01-2.07-2.39-3.47h0c-.46-1.67-.23-3.41.65-4.9h0c.88-1.5,2.3-2.57,4.01-3.02h0c.56-.15,1.14-.23,1.72-.23h0c1.42,0,2.84.47,3.98,1.31h0c1.18.87,2.01,2.07,2.39,3.47h0c.46,1.67.23,3.41-.65,4.9h0c-.88,1.5-2.3,2.57-4.01,3.02h0c-.57.15-1.15.23-1.72.23h0c-1.42,0-2.84-.47-3.98-1.31'
        fill='url(#logoGradient)'
        opacity='.4'
        strokeWidth='0'
      />
      <text
        id='id'
        transform='translate(4.8 13.83)'
        fill='#f79036'
        fontFamily="Iosevka-Term, 'Iosevka Term'"
        fontSize='11.06'
        pointerEvents='none'
      >
        <tspan x='0' y='0'>
          {firstFour}
        </tspan>
        <tspan x='0' y='10'>
          {lastFour}
        </tspan>
      </text>
      <g id='arrow'>
        <line
          x1='11.35'
          y1='27.45'
          x2='6.22'
          y2='27.45'
          fill='none'
          stroke='#f79036'
          strokeLinecap='round'
          strokeMiterlimit='10'
          strokeWidth='.75'
        />
        <line
          x1='8.04'
          y1='25.92'
          x2='6.22'
          y2='27.45'
          fill='none'
          stroke='#f79036'
          strokeLinecap='round'
          strokeMiterlimit='10'
          strokeWidth='.75'
        />
        <line
          x1='8.04'
          y1='28.98'
          x2='6.22'
          y2='27.45'
          fill='none'
          stroke='#f79036'
          strokeLinecap='round'
          strokeMiterlimit='10'
          strokeWidth='.75'
        />
      </g>
    </svg>
  );
};
