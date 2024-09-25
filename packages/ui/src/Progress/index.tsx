import * as ProgressPrimitive from '@radix-ui/react-progress';
import { styled, type DefaultTheme, keyframes } from 'styled-components';

export const infiniteLoading = keyframes`
  from {
    left: -20%;
  }
  to {
    left: 100%;
  }
`;

const Root = styled(ProgressPrimitive.Root)<{ $error: boolean }>`
  position: relative;
  width: 100%;
  height: ${props => props.theme.spacing(1)};
  background-color: ${props =>
    props.$error ? props.theme.color.destructive.light : props.theme.color.other.tonalFill5};
  transition: background-color 0.15s;
  overflow: hidden;
`;

export const getIndicatorColor = (theme: DefaultTheme, value: number, error: boolean): string => {
  if (error) {
    return theme.color.destructive.light;
  }

  if (value === 1) {
    return theme.color.secondary.light;
  }

  return theme.color.caution.light;
};

const Indicator = styled.div<{ $value: number; $error: boolean }>`
  height: 100%;
  width: 100%;
  background-color: ${props => getIndicatorColor(props.theme, props.$value, props.$error)};
  transition:
    transform 0.5s cubic-bezier(0.65, 0, 0.35, 1),
    background-color 0.15s;
  overflow: hidden;
`;

const Loading = styled.div`
  position: absolute;
  top: 0;
  left: -20%;
  width: 20%;
  height: 100%;
  filter: blur(2px);
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    #fff 50%,
    rgba(255, 255, 255, 0) 100%
  );
  animation: ${infiniteLoading} 1s linear infinite;
`;

export interface ProgressProps {
  /** Percentage value from 0 to 1 */
  value: number;
  /** Displays the skeleton-like moving shade */
  loading?: boolean;
  /** Renders red indicator while the progress continues */
  error?: boolean;
}

/**
 * Progress bar with loading and error states
 */
export const Progress = ({ value, loading, error = false }: ProgressProps) => (
  <Root value={value} max={1} $error={error}>
    <ProgressPrimitive.Indicator asChild>
      <Indicator
        $value={value}
        $error={error}
        style={{ transform: `translateX(-${100 - value * 100}%)` }}
      >
        {loading && <Loading />}
      </Indicator>
    </ProgressPrimitive.Indicator>
  </Root>
);
