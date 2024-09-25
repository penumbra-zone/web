import { styled, keyframes } from 'styled-components';

export type PopoverContext = 'default' | 'success' | 'caution' | 'error';

export const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const getPopoverBackground = (context: PopoverContext, theme: DefaultTheme) => {
  if (context === 'success') {
    return `radial-gradient(100% 100% at 0% 0%, rgba(83, 174, 168, 0.20) 0%, rgba(83, 174, 168, 0.02) 100%), ${theme.color.other.dialogBackground}`;
  }
  if (context === 'caution') {
    return `radial-gradient(100% 100% at 0% 0%, rgba(153, 97, 15, 0.20) 0%, rgba(153, 97, 15, 0.02) 100%), ${theme.color.other.dialogBackground}`;
  }
  if (context === 'error') {
    return `radial-gradient(100% 100% at 0% 0%, rgba(175, 38, 38, 0.20) 0%, rgba(175, 38, 38, 0.02) 100%), ${theme.color.other.dialogBackground}`;
  }
  return theme.color.other.dialogBackground;
};

export const PopoverContent = styled.div<{ $context: PopoverContext }>`
  display: flex;
  flex-direction: column;

  width: 240px;
  max-width: 320px;
  padding: ${props => props.theme.spacing(3)};

  background: ${props => getPopoverBackground(props.$context, props.theme)};
  border: 1px solid ${props => props.theme.color.other.tonalStroke};
  border-radius: ${props => props.theme.borderRadius.sm};
  backdrop-filter: blur(${props => props.theme.blur.lg});

  transform-origin: var(--radix-popper-transform-origin);
  animation: ${scaleIn} 0.15s ease-out;
`;
