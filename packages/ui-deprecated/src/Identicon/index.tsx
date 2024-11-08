import { useMemo } from 'react';
import { generateGradient, generateSolidColor } from './generate';
import { styled } from 'styled-components';

/**
 * The view box size is separate from the passed-in `size` prop.
 *
 * The view box controls how the elements inside the SVG are sized in relation
 * to the SVG as a whole. The passed-in `size` prop controls how big the SVG as
 * a whole is.
 */
const VIEW_BOX_SIZE = 24;

const Svg = styled.svg.attrs<{ $size: number }>(props => ({
  width: props.$size,
  height: props.$size,
  viewBox: `0 0 ${VIEW_BOX_SIZE} ${VIEW_BOX_SIZE}`,
  version: '1.1',
  xmlns: 'http://www.w3.org/2000/svg',
}))`
  display: block;
  border-radius: ${props => props.theme.borderRadius.full};
`;

const SvgText = styled.text`
  text-transform: uppercase;
  font-family: ${props => props.theme.font.default};
`;

export interface IdenticonProps {
  /**
   * The ID or other string representation of the object you want an identicon
   * for. `<Identicon />` will deterministically generate a solid color or
   * gradient (depending on the value of `type`) based on the value of
   * `uniqueIdentifier`.
   */
  uniqueIdentifier: string;
  /** The identicon size, in pixels. */
  size?: number;
  /**
   * When `solid`, will render a solid color along with the (upper-cased) first
   * character of `uniqueIdentifier`. When `gradient`, will render just a
   * gradient.
   */
  type: 'gradient' | 'solid';
}

/**
 * Renders an SVG icon whose color or gradient is deterministically generated
 * based on the value of the `uniqueIdentifier` prop.
 *
 * Use this for assets, addresses, etc. that don't otherwise have an icon.
 */
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
        <rect
          fill={`url(#${gradientId})`}
          x='0'
          y='0'
          width={VIEW_BOX_SIZE}
          height={VIEW_BOX_SIZE}
        />
      </g>
    </Svg>
  );
};

const IdenticonSolid = ({ uniqueIdentifier, size = 120 }: IdenticonProps) => {
  const color = useMemo(() => generateSolidColor(uniqueIdentifier), [uniqueIdentifier]);

  return (
    <Svg $size={size}>
      <rect fill={color.bg} x='0' y='0' width={VIEW_BOX_SIZE} height={VIEW_BOX_SIZE} />
      <SvgText x='50%' y='50%' textAnchor='middle' dy='.35em'>
        {uniqueIdentifier[0]}
      </SvgText>
    </Svg>
  );
};
