import { LiquidityDistributionShape } from '@/shared/math/position';
import { Text } from '@penumbra-zone/ui/Text';
import cn from 'clsx';
import ConcentratedDefault from '@/shared/assets/liquidity-shapes/Type=Concentrated, State=Default.svg';
import ConcentratedHover from '@/shared/assets/liquidity-shapes/Type=Concentrated, State=Hover.svg';
import ConcentratedSelected from '@/shared/assets/liquidity-shapes/Type=Concentrated, State=Selected.svg';
import StablekindDefault from '@/shared/assets/liquidity-shapes/Type=Stablekind, State=Default.svg';
import StablekindHover from '@/shared/assets/liquidity-shapes/Type=Stablekind, State=Hover.svg';
import StablekindSelected from '@/shared/assets/liquidity-shapes/Type=Stablekind, State=Selected.svg';
import VolatileDefault from '@/shared/assets/liquidity-shapes/Type=Volatile, State=Default.svg';
import VolatileHover from '@/shared/assets/liquidity-shapes/Type=Volatile, State=Hover.svg';
import VolatileSelected from '@/shared/assets/liquidity-shapes/Type=Volatile, State=Selected.svg';
import { useState } from 'react';
import { Tooltip } from '@penumbra-zone/ui/Tooltip';

const shapeMapping = {
  [LiquidityDistributionShape.FLAT]: {
    text: 'Linear',
    default: ConcentratedDefault,
    hover: ConcentratedHover,
    selected: ConcentratedSelected,
    tooltipMessage: '',
    disabled: true,
  },
  [LiquidityDistributionShape.PYRAMID]: {
    text: 'Concentrated',
    default: StablekindDefault,
    hover: StablekindHover,
    selected: StablekindSelected,
    tooltipMessage:
      'Concentrates liquidity around the current price. Best for pairs with low volatility or tight correlation.',
    disabled: false,
  },
  [LiquidityDistributionShape.INVERTED_PYRAMID]: {
    text: 'Volatile',
    default: VolatileDefault,
    hover: VolatileHover,
    selected: VolatileSelected,
    tooltipMessage:
      'Spreads liquidity across a wider range to capture more price movement. Ideal for volatile pairs.',
    disabled: false,
  },
};

const isSupportedShape = (
  shape: LiquidityDistributionShape,
): shape is keyof typeof shapeMapping => {
  return shape in shapeMapping;
};

export const LiquidityShape = ({
  shape,
  onClick,
  selected,
}: {
  shape: LiquidityDistributionShape;
  onClick: () => void;
  selected: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  if (!isSupportedShape(shape)) {
    return null;
  }

  const {
    text,
    default: Default,
    hover: Hover,
    selected: Selected,
    disabled,
    tooltipMessage,
  } = shapeMapping[shape];

  if (disabled) {
    return null;
  }

  return (
    <div
      key={shape}
      className={cn(
        'flex min-h-10 flex-1 flex-col items-center justify-center rounded-sm border p-3 active:opacity-80 active:duration-[0.1s]',
        selected ? 'bg-other-tonal-fill5' : undefined,
        selected ? 'border-primary-main' : 'border-transparent',
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Tooltip message={tooltipMessage}>
        <div className='relative mb-1 flex w-full justify-center'>
          <Default />
          <Hover
            className={cn(
              'absolute inset-0 z-10 h-full w-full transition-opacity duration-200',
              isHovered && !selected ? 'opacity-100' : 'opacity-0',
            )}
          />
          <Selected
            className={cn(
              'absolute inset-0 z-20 h-full w-full transition-opacity duration-200',
              selected ? 'opacity-100' : 'opacity-0',
            )}
          />
        </div>
        <Text detail color='text.secondary'>
          {text}
        </Text>
      </Tooltip>
    </div>
  );
};
