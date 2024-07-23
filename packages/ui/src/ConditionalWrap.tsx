import { ReactNode } from 'react';

export interface ConditionalWrapProps {
  if: boolean;
  then: (children: ReactNode) => ReactNode;
  else?: (children: ReactNode) => ReactNode;
  children: ReactNode;
}

/**
 * Internal utility component to optionally wrap a React component with another
 * React component, depending on a condition.
 *
 * @example
 * ```tsx
 * <ConditionalWrap
 *   if={shouldUseTooltip}
 *   then={(children) => (
 *     <Tooltip>
 *       <TooltipTrigger>{children}</TooltipTrigger>
 *       <TooltipContent>Here is the tooltip text.</TooltipContent>
 *     </Tooltip>
 *   )}
 * >
 *   Here is the content that may or may not need a tooltip.
 * </ConditionalWrap>
 * ```
 *
 * You can also pass an `else` prop to wrap the `children` if the condition is
 * _not_ met.
 *
 * @see https://stackoverflow.com/a/56870316/974981
 */
export const ConditionalWrap = ({
  children,

  // Rename these to avoid using reserved words
  if: condition,
  then: thenWrapper,
  else: elseWrapper,
}: ConditionalWrapProps) =>
  condition ? thenWrapper(children) : elseWrapper ? elseWrapper(children) : children;
