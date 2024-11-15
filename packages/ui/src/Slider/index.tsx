import React, { useState } from 'react';
import { Text } from '../Text';
import * as RadixSlider from '@radix-ui/react-slider';
import { ThemeColor, getThemeColorClass } from '../utils/color';
import cn from 'clsx';

interface SliderProps {
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  leftLabel?: string;
  rightLabel?: string;
  showValue?: boolean;
  valueDetails?: string;
  focusedOutlineColor?: ThemeColor;
  showTrackGaps?: boolean;
  trackGapBackground?: ThemeColor;
  showFill?: boolean;
  fontSize?: string;
  disabled?: boolean;
}

export const Slider: React.FC<SliderProps> = ({
  min = 0,
  max = 100,
  step = 1,
  defaultValue = 0,
  onChange,
  leftLabel,
  rightLabel,
  showValue = true,
  showFill = false,
  showTrackGaps = true,
  trackGapBackground = 'base.black',
  valueDetails,
  disabled = false,
}) => {
  const [value, setValue] = useState(defaultValue);
  const handleValueChange = (newValue: number[]) => {
    const updatedValue = newValue[0] ?? defaultValue;
    setValue(updatedValue);
    onChange?.(updatedValue);
  };

  const totalSteps = (max - min) / step;

  return (
    <div>
      {(!!leftLabel || !!rightLabel) && (
        <div className='flex justify-between w-full mb-2'>
          <Text detailTechnical as='div' color='text.secondary'>
            {leftLabel}
          </Text>
          <Text detailTechnical as='div' color='text.secondary'>
            {rightLabel}
          </Text>
        </div>
      )}
      <RadixSlider.Root
        className='relative flex items-center w-full h-8'
        min={min}
        max={max}
        step={step}
        defaultValue={[defaultValue]}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <RadixSlider.Track className='relative w-full h-2 bg-other-tonalFill10 rounded-full px-2'>
          {showFill && (
            <RadixSlider.Range className='absolute h-full bg-primary-main rounded-full' />
          )}
          <div className='relative'>
            {showTrackGaps &&
              Array.from({ length: totalSteps + 1 })
                .map((_, i): number => (i / totalSteps) * 100)
                .map(left => {
                  return (
                    <div
                      key={left}
                      className={cn(
                        'absolute w-1 h-2 -translate-x-1/2',
                        getThemeColorClass(trackGapBackground).bg,
                      )}
                      style={{
                        left: `${left}%`,
                      }}
                    />
                  );
                })}
          </div>
        </RadixSlider.Track>
        <RadixSlider.Thumb
          className={cn(
            'block w-4 h-4 rounded-full bg-neutral-contrast',
            !disabled && 'cursor-grab hover:bg-neutral-contrast focus:outline focus:outline-2',
            !disabled && `focus:outline-primary-main`,
            disabled &&
              "after:content-[''] after:absolute after:inset-0 after:bg-action-disabledOverlay",
          )}
        />
      </RadixSlider.Root>
      {showValue && (
        <div className='flex mt-4 border border-other-tonalStroke text-text-primary px-3 py-2 rounded-sm'>
          <Text as='div' detail color='text.primary'>
            {value}
          </Text>
          {valueDetails && (
            <div className='ml-2'>
              <Text as='div' detail color='text.secondary'>
                · {valueDetails}
              </Text>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
