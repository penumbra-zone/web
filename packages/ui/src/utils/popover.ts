import { styled, keyframes } from 'styled-components';

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

export const PopoverContent = styled.div`
  display: flex;
  flex-direction: column;

  width: 240px;
  max-width: 320px;
  padding: ${props => props.theme.spacing(3)};

  background: ${props => props.theme.color.other.dialogBackground};
  border: 1px solid ${props => props.theme.color.other.tonalStroke};
  border-radius: ${props => props.theme.borderRadius.sm};
  backdrop-filter: blur(${props => props.theme.blur.lg});

  transform-origin: var(--radix-popper-transform-origin);
  animation: ${scaleIn} 0.15s ease-out;
`;
