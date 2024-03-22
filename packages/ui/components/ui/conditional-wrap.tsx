import { ReactNode } from 'react';

/**
 * Little utility component to optionally wrap a React component with another
 * React component, depending on a condition.
 *
 * @example
 * ```tsx
 * <ConditionalWrap
 *   condition={shouldUseTooltip}
 *   wrap={(children) => (
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
 * @see https://stackoverflow.com/a/56870316/974981
 */
export const ConditionalWrap = ({
  condition,
  wrap,
  children,
}: {
  condition: boolean;
  wrap: (children: ReactNode) => ReactNode;
  children: ReactNode;
}) => (condition ? wrap(children) : children);
