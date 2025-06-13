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

const shapeMapping = {
  [LiquidityDistributionShape.FLAT]: {
    text: 'Linear',
    default: ConcentratedDefault,
    hover: ConcentratedHover,
    selected: ConcentratedSelected,
    disabled: true,
  },
  [LiquidityDistributionShape.PYRAMID]: {
    text: 'Locally stable',
    default: StablekindDefault,
    hover: StablekindHover,
    selected: StablekindSelected,
    disabled: false,
  },
  [LiquidityDistributionShape.INVERTED_PYRAMID]: {
    text: 'Volatile',
    default: VolatileDefault,
    hover: VolatileHover,
    selected: VolatileSelected,
    disabled: false,
  },
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
  const {
    text,
    default: Default,
    hover: Hover,
    selected: Selected,
    disabled,
  } = shapeMapping[shape];
  const [isHovered, setIsHovered] = useState(false);

  if (disabled) {
    return null;
  }

  return (
    <button
      key={shape}
      className={cn(
        'p-3 rounded-sm flex-1 min-h-10 border flex flex-col items-center justify-center active:opacity-80 active:duration-[0.1s]',
        selected ? 'bg-other-tonalFill5' : undefined,
        selected ? 'border-primary-main' : 'border-transparent',
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className='relative flex justify-center w-full mb-1'>
        <Default />
        <Hover
          className={cn(
            'absolute z-10 inset-0 w-full h-full transition-opacity duration-200',
            isHovered && !selected ? 'opacity-100' : 'opacity-0',
          )}
        />
        <Selected
          className={cn(
            'absolute z-20 inset-0 w-full h-full transition-opacity duration-200',
            selected ? 'opacity-100' : 'opacity-0',
          )}
        />
      </div>
      <Text detail color='text.secondary'>
        {text}
      </Text>
    </button>
  );
};
