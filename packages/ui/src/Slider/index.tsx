import React, { useState, useEffect } from 'react';
import { Text } from '../Text';
import * as RadixSlider from '@radix-ui/react-slider';
import { ThemeColor, getThemeColorClass } from '../utils/color';
import cn from 'clsx';

interface SliderProps {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
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
  value: valueProp,
  defaultValue,
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
  const [value, setValue] = useState(valueProp ?? defaultValue ?? 0);
  const handleValueChange = (newValue: number[]) => {
    const updatedValue = newValue[0] ?? defaultValue ?? 0;
    setValue(updatedValue);
    onChange?.(updatedValue);
  };

  useEffect(() => {
    if (valueProp !== undefined) {
      setValue(valueProp);
    }
  }, [valueProp]);

  const totalSteps = (max - min) / step;

  return (
    <div>
      {(!!leftLabel || !!rightLabel) && (
        <div className='mb-2 flex w-full justify-between'>
          <Text detailTechnical as='div' color='text.secondary'>
            {leftLabel}
          </Text>
          <Text detailTechnical as='div' color='text.secondary'>
            {rightLabel}
          </Text>
        </div>
      )}
      <RadixSlider.Root
        className='relative flex h-8 w-full items-center'
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <RadixSlider.Track className='relative h-2 w-full rounded-full bg-other-tonal-fill10 px-2'>
          {showFill && (
            <RadixSlider.Range className='absolute h-full rounded-full bg-primary-main' />
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
            !disabled &&
              'cursor-grab hover:bg-neutral-contrast focus:outline-solid focus:outline-2',
            !disabled && `focus:outline-primary-main`,
            disabled &&
              "after:content-[''] after:absolute after:inset-0 after:bg-action-disabled-overlay",
          )}
        />
      </RadixSlider.Root>
      {showValue && (
        <div className='mt-4 flex rounded-sm border border-other-tonal-stroke px-3 py-2 text-text-primary'>
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
