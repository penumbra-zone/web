import React, { ReactNode, useMemo } from 'react';
import { RadioGroupItem } from '@radix-ui/react-radio-group';
import { styled } from 'styled-components';
import { motion } from 'framer-motion';
import { Text } from '../Text';
import { ActionType, getOutlineColorByActionType } from '../utils/ActionType';
import { asTransientProps } from '../utils/asTransientProps';

const Root = styled(motion.button)<{
  $actionType: ActionType;
  $disabled?: boolean;
}>`
  border-radius: ${props => props.theme.borderRadius.sm};
  background-color: ${props => props.theme.color.other.tonalFill5};
  padding: ${props => props.theme.spacing(3)};

  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: left;
  transition:
    background 0.15s,
    outline 0.15s;

  &:hover {
    background:
      linear-gradient(
        0deg,
        ${props => props.theme.color.action.hoverOverlay} 0%,
        ${props => props.theme.color.action.hoverOverlay} 100%
      ),
      ${props => props.theme.color.other.tonalFill5};
  }

  &:focus {
    background:
      linear-gradient(
        0deg,
        ${props => props.theme.color.action.hoverOverlay} 0%,
        ${props => props.theme.color.action.hoverOverlay} 100%
      ),
      ${props => props.theme.color.other.tonalFill5};
    outline: 2px solid ${props => getOutlineColorByActionType(props.theme, props.$actionType)};
  }

  &[aria-checked='true'] {
    outline: 2px solid ${props => getOutlineColorByActionType(props.theme, props.$actionType)};
  }

  &:disabled {
    background:
      linear-gradient(
        0deg,
        ${props => props.theme.color.action.disabledOverlay} 0%,
        ${props => props.theme.color.action.disabledOverlay} 100%
      ),
      ${props => props.theme.color.other.tonalFill5};
  }
`;

const Info = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing(2)};
  align-items: center;
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  white-space: nowrap;
  gap: ${props => props.theme.spacing(1)};
`;

export interface DialogRadioItemProps {
  /** A required unique string value defining the radio item */
  value: string;
  title: ReactNode;
  description?: ReactNode;
  /** A component rendered on the left side of the item */
  endAdornment?: ReactNode;
  /** A component rendered on the right side of the item */
  startAdornment?: ReactNode;
  disabled?: boolean;
  actionType?: ActionType;
  /** A function that closes the dialog on select of the item */
  onClose?: VoidFunction;
  /** Fires when the item is clicked or focused using the keyboard */
  onSelect?: VoidFunction;
}

/** A radio button that selects an asset or a balance from the `AssetSelector` */
export const RadioItem = ({
  value,
  title,
  description,
  startAdornment,
  endAdornment,
  disabled,
  actionType = 'default',
  onClose,
  onSelect,
}: DialogRadioItemProps) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Is a click and not an arrow key up/down
    if (event.detail > 0) {
      onSelect?.();
      onClose?.();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect?.();
      onClose?.();
    }
  };

  const descriptionText = useMemo(() => {
    if (!description) {
      return null;
    }

    if (typeof description === 'string') {
      return (
        <Text detail color={color => color.text.secondary} as='div'>
          {description}
        </Text>
      );
    }

    return description;
  }, [description]);

  return (
    <RadioGroupItem key={value} disabled={disabled} value={value} asChild>
      <Root
        {...asTransientProps({ actionType, disabled })}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        <Info>
          {startAdornment}
          <div>
            <Title>{title}</Title>
            {descriptionText}
          </div>
        </Info>

        {endAdornment}
      </Root>
    </RadioGroupItem>
  );
};
