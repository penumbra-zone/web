import * as React from 'react';
import { cn } from '../../../lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'layout'> {
  gradient?: boolean;
  light?: boolean;
  layout?: boolean;
}

const Card = (
  { className, gradient, light, children, layout, ...htmlProps }: CardProps,
  ref: React.Ref<HTMLDivElement>,
) => {
  const baseClasses = 'rounded-lg shadow-sm p-[30px] overflow-hidden';
  const motionProps: HTMLMotionProps<'div'> = {
    ...(htmlProps as any),
    layout,
    ref,
    className: cn(
      baseClasses,
      light ? 'bg-stone-300' : gradient ? 'bg-card-radial' : 'bg-charcoal',
      className,
    ),
  };

  return <motion.div {...motionProps}>{children}</motion.div>;
};
Card.displayName = 'Card';

const CardHeader = (
  { className, ...props }: React.HTMLAttributes<HTMLDivElement>,
  ref: React.Ref<HTMLDivElement>,
) => <div ref={ref} className={cn('flex flex-col gap-2', className)} {...props} />;
CardHeader.displayName = 'CardHeader';

const CardTitle = (
  { className, ...props }: React.HTMLAttributes<HTMLHeadingElement>,
  ref: React.Ref<HTMLHeadingElement>,
) => (
  <h3
    ref={ref}
    className={cn('text-2xl leading-9 font-bold font-headline', className)}
    {...props}
  />
);
CardTitle.displayName = 'CardTitle';

const CardDescription = (
  { className, ...props }: React.HTMLAttributes<HTMLParagraphElement>,
  ref: React.Ref<HTMLParagraphElement>,
) => <p ref={ref} className={cn('text-muted-foreground', className)} {...props} />;
CardDescription.displayName = 'CardDescription';

const CardContent = (
  { className, ...props }: React.HTMLAttributes<HTMLDivElement>,
  ref: React.Ref<HTMLDivElement>,
) => <div ref={ref} className={cn('', className)} {...props} />;
CardContent.displayName = 'CardContent';

const CardFooter = (
  { className, ...props }: React.HTMLAttributes<HTMLDivElement>,
  ref: React.Ref<HTMLDivElement>,
) => <div ref={ref} className={cn('flex items-center', className)} {...props} />;
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
