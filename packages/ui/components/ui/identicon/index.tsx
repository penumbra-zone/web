import { useMemo } from 'react';
import { generateGradient } from './gradient';

export interface IdenticonProps {
  name: string;
  size?: number;
  className?: string;
}

export const Identicon = ({ name, size = 120, className }: IdenticonProps) => {
  const gradient = useMemo(() => generateGradient(name), [name]);

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
          <linearGradient id='gradient' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' stopColor={gradient.fromColor} />
            <stop offset='100%' stopColor={gradient.toColor} />
          </linearGradient>
        </defs>
        <rect fill='url(#gradient)' x='0' y='0' width={size} height={size} />
      </g>
    </svg>
  );
};

Identicon.displayName = 'Identicon';
