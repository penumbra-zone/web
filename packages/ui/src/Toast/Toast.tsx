import type { FC } from 'react';
import { X, type LucideIcon } from 'lucide-react';
import { DefaultTheme, styled } from 'styled-components';
import {
  Root as RadixToastRoot,
  Close as RadixToastClose,
  Title as RadixToastTitle,
  Description as RadixToastDescription,
} from '@radix-ui/react-toast';
import { useDensity } from '../hooks/useDensity';
import { ActionType } from '../utils/ActionType.ts';
import { Text } from '../Text';
import { Icon } from '../Icon';
import { useToastContext, useToastProps } from './Context.ts';

const getBackground = (theme: DefaultTheme, actionType: ActionType) => {
  if (actionType === 'unshield') {
    return theme.color.unshield.light;
  }
  if (actionType === 'accent') {
    return theme.color.secondary.light;
  }
  if (actionType === 'destructive') {
    return theme.color.destructive.light;
  }
  return theme.color.primary.light;
};

const ToastRoot = styled(RadixToastRoot)<{
  $actionType: ActionType;
}>`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${props => props.theme.spacing(3)};
  padding: ${props => props.theme.spacing(3)};
  border-radius: ${props => props.theme.borderRadius.sm};
  background-color: ${props => getBackground(props.theme, props.$actionType)};
  color: ${props => props.theme.color.primary.dark};
  transition: transform 0.05s;

  &[data-swipe='move'] {
    transform: translateX(var(--radix-toast-swipe-move-x));
  }
`;

const Info = styled.div`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  text-align: left;
  gap: ${props => props.theme.spacing(1)};
`;

const IconAdornment = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing(1)};
  width: ${props => props.theme.spacing(6)};
  height: ${props => props.theme.spacing(6)};
  border-radius: ${props => props.theme.borderRadius.full};
  background-color: transparent;
`;

export interface ToastProps {
  actionType?: ActionType;
  icon?: LucideIcon | FC;
  title: string;
  description?: string;
}

export interface ToastInnerProps {
  id: string;
}

export const Toast = ({ id }: ToastInnerProps) => {
  const { actionType = 'default', icon, description, title } = useToastProps(id);
  const { removeToast } = useToastContext();
  const density = useDensity();

  const onClose = (value: boolean) => {
    if (!value) {
      removeToast(id);
    }
  };

  return (
    <ToastRoot open={true} duration={5000} $actionType={actionType} onOpenChange={onClose}>
      {density === 'sparse' && icon && <Icon IconComponent={icon} size='md' />}
      {density === 'compact' ? (
        <RadixToastTitle asChild>
          <Text small color={() => 'inherit'}>
            {title}
          </Text>
        </RadixToastTitle>
      ) : (
        <Info>
          <RadixToastTitle asChild>
            <Text strong color={() => 'inherit'}>
              {title}
            </Text>
          </RadixToastTitle>
          {description && (
            <RadixToastDescription asChild>
              <Text small color={() => 'inherit'}>
                {description}
              </Text>
            </RadixToastDescription>
          )}
        </Info>
      )}
      <RadixToastClose asChild>
        <IconAdornment type='button'>
          <Icon IconComponent={X} size='md' />
        </IconAdornment>
      </RadixToastClose>
    </ToastRoot>
  );
};
