import { useMemo } from 'react';
import { generateGradient, generateSolidColor } from './generate';
import styled from 'styled-components';

const Svg = styled.svg.attrs<{ $size: number }>(props => ({
  width: props.$size,
  height: props.$size,
  viewBox: `0 0 ${props.$size} ${props.$size}`,
  version: '1.1',
  xmlns: 'http://www.w3.org/2000/svg',
}))`
  display: block;
  border-radius: ${props => props.theme.borderRadius.full};
`;

export interface IdenticonProps {
  uniqueIdentifier: string;
  size?: number;
  className?: string;
  type: 'gradient' | 'solid';
}

export const Identicon = (props: IdenticonProps) => {
  if (props.type === 'gradient') {
    return <IdenticonGradient {...props} />;
  }
  return <IdenticonSolid {...props} />;
};

const IdenticonGradient = ({ uniqueIdentifier, size = 120 }: IdenticonProps) => {
  const gradient = useMemo(() => generateGradient(uniqueIdentifier), [uniqueIdentifier]);
  const gradientId = useMemo(() => `gradient-${uniqueIdentifier}`, [uniqueIdentifier]);

  return (
    <Svg $size={size}>
      <g>
        <defs>
          <linearGradient id={gradientId} x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' stopColor={gradient.fromColor} />
            <stop offset='100%' stopColor={gradient.toColor} />
          </linearGradient>
        </defs>
        <rect fill={`url(#${gradientId})`} x='0' y='0' width={size} height={size} />
      </g>
    </Svg>
  );
};

const IdenticonSolid = ({ uniqueIdentifier, size = 120 }: IdenticonProps) => {
  const color = useMemo(() => generateSolidColor(uniqueIdentifier), [uniqueIdentifier]);

  return (
    <Svg $size={size}>
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
    </Svg>
  );
};
