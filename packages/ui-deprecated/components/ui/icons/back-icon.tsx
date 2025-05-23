import * as React from 'react';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import { IconProps } from '@radix-ui/react-icons/dist/types';
import { cn } from '../../../lib/utils';

// RefAttributes is for the type system to know it can receive a ref,
// the actual ref prop comes from IconProps if it extends SVGAttributes
export type BackIconProps = IconProps & { ref?: React.Ref<SVGSVGElement> };

const BackIcon = (
  { className, ref, ...props }: BackIconProps, // Destructure ref from props
) => {
  return (
    <ArrowLeftIcon
      className={cn('h-6 w-6 cursor-pointer text-muted-foreground hover:text-white', className)}
      ref={ref} // Pass ref to ArrowLeftIcon
      {...props}
    ></ArrowLeftIcon>
  );
};

BackIcon.displayName = 'BackIcon';

export { BackIcon };
