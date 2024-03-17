import { useMemo } from 'react';
import djb2a from 'djb2a';
import color from 'tinycolor2';

export interface IdenticonProps {
  uniqueIdentifier: string;
  size?: number;
  className?: string;
}

export const Identicon = ({ type, ...props }: IdenticonProps & { type: 'gradient' | 'solid' }) => {
  if (type === 'gradient') return <IdenticonGradient {...props} />;
  return <IdenticonSolid {...props} />;
};

const IdenticonGradient = ({ uniqueIdentifier, size = 120, className }: IdenticonProps) => {
  const gradient = useMemo(() => generateGradient(uniqueIdentifier), [uniqueIdentifier]);
  const gradientId = useMemo(() => `gradient-${uniqueIdentifier}`, [uniqueIdentifier]);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      version='1.1'
      xmlns='http://www.w3.org/2000/svg'
      className={className}
    >
      <g>
        <defs>
          <linearGradient id={gradientId} x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' stopColor={gradient.fromColor} />
            <stop offset='100%' stopColor={gradient.toColor} />
          </linearGradient>
        </defs>
        <rect fill={`url(#${gradientId})`} x='0' y='0' width={size} height={size} />
      </g>
    </svg>
  );
};

const IdenticonSolid = ({ uniqueIdentifier, size = 120, className }: IdenticonProps) => {
  const color = useMemo(() => generateSolidColor(uniqueIdentifier), [uniqueIdentifier]);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      version='1.1'
      xmlns='http://www.w3.org/2000/svg'
      className={className}
    >
      <rect fill={color.bg} x='0' y='0' width={size} height={size} />
      <text
        x='50%'
        y='50%'
        textAnchor='middle'
        stroke={color.text}
        strokeWidth='1px'
        dy='.3em'
        className='uppercase'
      >
        {uniqueIdentifier[0]}
      </text>
    </svg>
  );
};

// Inspired by: https://github.com/vercel/avatar

// Deterministically getting a gradient from a string for use as an identicon
export const generateGradient = (str: string) => {
  // Get first color
  const hash = djb2a(str);
  const c = color({ h: hash % 360, s: 0.95, l: 0.5 });

  const tetrad = c.tetrad(); // 4 colors spaced around the color wheel, the first being the input
  const secondColorOptions = tetrad.slice(1);
  const index = hash % 3;
  const toColor = secondColorOptions[index]!.toHexString();

  return {
    fromColor: c.toHexString(),
    toColor,
  };
};

export const generateSolidColor = (str: string) => {
  // Get color
  const hash = djb2a(str);
  const c = color({ h: hash % 360, s: 0.95, l: 0.5 })
    .saturate(0)
    .darken(20);

  return {
    bg: c.toHexString(),
    // get readable text color
    text: color
      .mostReadable(c, ['white', 'black'], {
        includeFallbackColors: true,
        level: 'AAA',
        size: 'small',
      })
      .saturate()
      .darken(20)
      .toHexString(),
  };
};
