import { useMemo } from 'react';
import { generateColor } from './generate';
import { IdenticonProps } from './types';

export const IdenticonColor = ({ name, size = 120, className }: IdenticonProps) => {
  const color = useMemo(() => generateColor(name), [name]);

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
        {name[0]}
      </text>
    </svg>
  );
};

IdenticonColor.displayName = 'IdenticonColor';
