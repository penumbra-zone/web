import React, { useState } from 'react';
import { styled, css } from 'styled-components';
import * as RadixSlider from '@radix-ui/react-slider';
import { detail, detailTechnical } from '../utils/typography';
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
  focusedOutlineColor?: string;
  showTrackGaps?: boolean;
  trackGapBackground?: string;
  showFill?: boolean;
  fontSize?: string;
  disabled?: boolean;
}

const THUMB_SIZE = theme.spacing(4);
const TRACK_HEIGHT = theme.spacing(1);

const SliderContainer = styled(RadixSlider.Root)`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: ${THUMB_SIZE};
`;

const Track = styled(RadixSlider.Track)`
  background-color: ${props => props.theme.color.other.tonalFill10};
  position: relative;
  width: 100%;
  height: ${TRACK_HEIGHT};
`;

const TrackGap = styled.div<{ $left: number; $gapBackground?: string }>`
  position: absolute;
  width: 2px;
  height: ${TRACK_HEIGHT};
  left: ${props => props.$left}%;
  transform: translateX(-50%);
  background-color: ${props => props.$gapBackground};
`;

const Range = styled(RadixSlider.Range)`
  position: absolute;
  background-color: ${props => props.theme.color.primary.main};
  height: 100%;
`;

const Thumb = styled(RadixSlider.Thumb)<{
  $focusedOutlineColor: string;
  $disabled: boolean;
}>`
  display: block;
  width: ${THUMB_SIZE};
  height: ${THUMB_SIZE};
  background-color: ${props => props.theme.color.neutral.contrast};
  border-radius: 50%;

  ${props =>
    props.$disabled
      ? css`
          &:after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: ${props => props.theme.color.action.disabledOverlay};
          }
        `
      : css<{ $focusedOutlineColor: string }>`
          cursor: grab;

          &:hover {
            background-color: ${props => props.theme.color.neutral.contrast};
          }

          &:focus {
            outline: 2px solid ${props => props.$focusedOutlineColor};
          }
        `}
`;

const LabelContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing(1)};
`;

const Label = styled.div<{ $position: 'left' | 'right'; $fontSize: string }>`
  ${detailTechnical}
  font-size: ${props => props.$fontSize};
  color: ${props => props.theme.color.text.secondary};
  justify-self: ${props => (props.$position === 'left' ? 'flex-start' : 'flex-end')};
`;

const ValueContainer = styled.div<{ $fontSize: string }>`
  ${detail}
  display: flex;
  margin-top: ${props => props.theme.spacing(2)};
  border: 1px solid ${props => props.theme.color.other.tonalStroke};
  font-size: ${props => props.$fontSize};
  color: ${props => props.theme.color.text.primary};
  padding: ${props => props.theme.spacing(2)} ${props => props.theme.spacing(3)};
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
  showValue = true,
  showFill = false,
  showTrackGaps = true,
  trackGapBackground = theme.color.base.black,
  focusedOutlineColor = theme.color.action.neutralFocusOutline,
  valueDetails,
  fontSize = theme.fontSize.textXs,
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
        <LabelContainer>
          <Label $fontSize={fontSize} $position='left'>
            {leftLabel}
          </Label>
          <Label $fontSize={fontSize} $position='right'>
            {rightLabel}
          </Label>
        </LabelContainer>
      )}
      <SliderContainer
        min={min}
        max={max}
        step={step}
        defaultValue={[defaultValue]}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <Track>
          {showFill && <Range />}
          {showTrackGaps &&
            Array.from({ length: totalSteps - 1 })
              .map((_, i): number => ((i + 1) / totalSteps) * 100)
              .map(left => (
                <TrackGap key={left} $left={left} $gapBackground={trackGapBackground} />
              ))}
        </Track>
        <Thumb $disabled={disabled} $focusedOutlineColor={focusedOutlineColor} />
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
