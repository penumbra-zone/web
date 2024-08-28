import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { theme } from '../PenumbraUIProvider/theme';

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
  showTrackGaps?: boolean;
  trackGapBackground?: string;
  showFill?: boolean;
  fontSize?: string;
}

const THUMB_SIZE = '16px';
const TRACK_HEIGHT = '4px';
const TRACK_GAP_WIDTH = '4px';

const SliderContainer = styled.div`
  position: relative;
  width: 100%;
  height: ${THUMB_SIZE};
  cursor: pointer;
  touch-action: none;
`;

const SliderTrack = styled.div`
  position: absolute;
  width: 100%;
  top: 50%;
  transform: translateY(-50%);
  height: ${TRACK_HEIGHT};
  background: rgba(250, 250, 250, 0.1);
`;

const SliderGap = styled.div<{ $left: number; $background: string }>`
  position: absolute;
  z-index: 2;
  width: ${TRACK_GAP_WIDTH};
  height: ${TRACK_HEIGHT};
  background: ${props => props.$background};
  left: ${props => props.$left}%;
  transform: translateX(-50%);
`;

const SliderThumb = styled.div<{ $left: number }>`
  position: absolute;
  z-index: 3;
  width: ${THUMB_SIZE};
  height: ${THUMB_SIZE};
  background: ${props => props.theme.color.neutral.contrast};
  border-radius: 50%;
  left: ${props => props.$left}%;
  top: 50%;
  transform: translate(-50%, -50%);
  cursor: grab;
  touch-action: none;
`;

const SliderFill = styled.div<{ percentage: number }>`
  position: absolute;
  z-index: 1;
  height: ${TRACK_HEIGHT};
  background: ${props => props.theme.color.primary.main};
  border-radius: 2px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  width: ${props => props.percentage}%;
`;

const LabelContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing(1)};
`;

const Label = styled.div<{ $position: 'left' | 'right'; $fontSize: string }>`
  font-size: ${props => props.$fontSize};
  color: ${props => props.theme.color.text.secondary};
  justify-self: ${props => (props.$position === 'left' ? 'flex-start' : 'flex-end')};
`;

const ValueContainer = styled.div<{ $fontSize: string }>`
  display: flex;
  margin-top: ${props => props.theme.spacing(1)};
  border: 1px solid ${props => props.theme.color.other.tonalStroke};
  font-size: ${props => props.$fontSize};
  color: ${props => props.theme.color.text.primary};
  padding: ${props => props.theme.spacing(1)} ${props => props.theme.spacing(2)};
`;

const ValueDisplay = styled.div`
  color: ${props => props.theme.color.text.primary};
`;

const ValueDetails = styled.div`
  margin-left: ${props => props.theme.spacing(1)};
  color: ${props => props.theme.color.text.secondary};
`;

export const Slider: React.FC<SliderProps> = ({
  min = 0,
  max = 100,
  step = 1,
  defaultValue = 0,
  onChange,
  leftLabel,
  rightLabel,
  showValue = false,
  valueDetails,
  showTrackGaps = true,
  trackGapBackground = theme.color.base.black,
  showFill = false,
  fontSize = theme.fontSize.textSm,
}) => {
  const [value, setValue] = useState(defaultValue);
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleChange = (newValue: number) => {
    const clampedValue = Math.min(Math.max(newValue, min), max);
    const steppedValue = Math.round((clampedValue - min) / step) * step + min;
    setValue(steppedValue);
    onChange?.(steppedValue);
  };

  const updateValue = (clientX: number) => {
    if (sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect();
      const percentage = (clientX - rect.left) / rect.width;
      const newValue = percentage * (max - min) + min;
      handleChange(newValue);
    }
  };

  const handleStart = (
    event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    const clientX = 'touches' in event ? event.touches[0]?.clientX : event.clientX;
    if (clientX !== undefined) {
      updateValue(clientX);
    }

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const moveClientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX;
      if (moveClientX !== undefined) {
        updateValue(moveClientX);
      }
    };

    const handleEnd = () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchend', handleEnd);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('touchmove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchend', handleEnd);
  };

  const range = max - min;
  const numberOfSteps = Math.floor(range / step);
  const percentage = ((value - min) / range) * 100;

  return (
    <div>
      {(!!leftLabel || !!rightLabel) && (
        <LabelContainer>
          <Label $fontSize={fontSize} $position='left'>
            {leftLabel}
          </Label>
          <Label $fontSize={fontSize} $position='right'>
            {rightLabel}
          </Label>
        </LabelContainer>
      )}
      <SliderContainer ref={sliderRef} onMouseDown={handleStart} onTouchStart={handleStart}>
        <SliderTrack>
          {showTrackGaps &&
            Array.from({ length: numberOfSteps + 1 }).map((_, index) => (
              <SliderGap
                key={index}
                $left={((index * step) / range) * 100}
                $background={trackGapBackground}
              />
            ))}
          {showFill && <SliderFill percentage={percentage} />}
          <SliderThumb $left={percentage} />
        </SliderTrack>
      </SliderContainer>
      {showValue && (
        <ValueContainer $fontSize={fontSize}>
          <ValueDisplay>{value}</ValueDisplay>
          {valueDetails && <ValueDetails>· {valueDetails}</ValueDetails>}
        </ValueContainer>
      )}
    </div>
  );
};
