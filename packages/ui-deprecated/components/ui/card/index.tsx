import * as React from 'react';
import { cn } from '../../../lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface CardProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  gradient?: boolean;
  light?: boolean;
  ref?: React.Ref<HTMLDivElement>;
}

const Card = ({ className, gradient, light, children, layout, ref, ...rest }: CardProps) => {
  const baseClasses = 'rounded-lg shadow-sm p-[30px] overflow-hidden';
  return (
    <motion.div
      layout={layout} // layout prop from HTMLMotionProps
      ref={ref}
      className={cn(
        baseClasses,
        light ? 'bg-stone-300' : gradient ? 'bg-card-radial' : 'bg-charcoal',
        className,
      )}
      {...rest}
    >
      {children}
    </motion.div>
  );
};
Card.displayName = 'Card';

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
}
const CardHeader = ({ className, ref, ...props }: CardHeaderProps) => (
  <div ref={ref} className={cn('flex flex-col gap-2', className)} {...props} />
);
CardHeader.displayName = 'CardHeader';

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  ref?: React.Ref<HTMLHeadingElement>;
}
const CardTitle = ({ className, ref, ...props }: CardTitleProps) => (
  <h3
    ref={ref}
    className={cn('text-2xl leading-9 font-bold font-headline', className)}
    {...props}
  />
);
CardTitle.displayName = 'CardTitle';

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  ref?: React.Ref<HTMLParagraphElement>;
}
const CardDescription = ({ className, ref, ...props }: CardDescriptionProps) => (
  <p ref={ref} className={cn('text-muted-foreground', className)} {...props} />
);
CardDescription.displayName = 'CardDescription';

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
}
const CardContent = ({ className, ref, ...props }: CardContentProps) => (
  <div ref={ref} className={cn('', className)} {...props} />
);
CardContent.displayName = 'CardContent';

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
}
const CardFooter = ({ className, ref, ...props }: CardFooterProps) => (
  <div ref={ref} className={cn('flex items-center', className)} {...props} />
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
