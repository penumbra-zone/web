'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';
import { cn } from '../../lib/utils';
import { cva, VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';

/**
 * You can use a `<Dialog />` in two ways.
 *
 * 1) Letting it manage its own internal open vs. closed state.
 *
 * @example
 * ```tsx
 * <Dialog>
 *   <DialogTrigger>
 *     <div>Clicking this will open the dialog.</div>
 *   </DialogTrigger>
 *
 *   <DialogContent>
 *     <DialogHeader>
 *       Header here, which includes a built-in close button.
 *     </DialogHeader>
 *     <p>Content here</p>
 *     <DialogClose>
 *       <div>Clicking anything inside here will close the dialog.</div>
 *     </DialogClose>
 *   </DialogContent>
 * </Dialog
 * ```
 *
 * 2) Manage its own open vs. closed state from the parent component
 *
 * @example
 * ```tsx
 * <Dialog open={open} onOpenChange={handleOpenChange}>
 *   <DialogContent>
 *     <DialogHeader>
 *       Header here, which includes a built-in close button.
 *     </DialogHeader>
 *     <p>Content here</p>
 *     <DialogClose>
 *       <div>Clicking anything inside here will close the dialog.</div>
 *     </DialogClose>
 *   </DialogContent>
 * </Dialog
 * ```
 */
const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:fill-mode-forwards data-[state=closed]:fill-mode-forwards',
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const dialogContentVariants = cva(
  [
    'fixed',
    'left-1/2',
    'top-1/2',
    'z-50',
    'grid',
    'w-full',
    'max-h-screen',
    '-translate-x-1/2',
    '-translate-y-1/2',
    'gap-4',
    'rounded-lg',
    'shadow-lg',
    'duration-200',
    'data-[state=open]:animate-in',
    'data-[state=closed]:animate-out',
    'data-[state=closed]:fade-out-0',
    'data-[state=open]:fade-in-0',
    'data-[state=closed]:zoom-out-95',
    'data-[state=open]:zoom-in-95',
    'data-[state=closed]:slide-out-to-left-1/2',
    'data-[state=closed]:slide-out-to-top-[48%]',
    'data-[state=open]:slide-in-from-left-1/2',
    'data-[state=open]:slide-in-from-top-[48%]',
    'sm:rounded-lg',
    'data-[state=closed]:fill-mode-forwards',
    'data-[state=open]:fill-mode-forwards',
  ],
  {
    variants: {
      size: {
        lg: ['max-w-5xl'],
        sm: ['max-w-[312px]', 'md:max-w-[400px]'],
      },
    },
    defaultVariants: {
      size: 'sm',
    },
  },
);
interface DialogContentProps extends VariantProps<typeof dialogContentVariants> {
  children?: React.ReactNode;
  layoutId?: string;
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ children, size, layoutId }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content ref={ref} className={cn(dialogContentVariants({ size }))}>
      <motion.div layout layoutId={layoutId} className='bg-card-radial'>
        {children}
      </motion.div>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ children }: { children?: React.ReactNode }) => (
  <div
    className={cn(
      'flex items-center gap-4 px-4 text-xl leading-[30px] font-headline font-semibold h-[70px] border-b shrink-0 overflow-hidden w-full',
    )}
  >
    <DialogPrimitive.Close
      aria-label='Close'
      className='rounded-sm text-muted-foreground ring-offset-background transition-opacity hover:opacity-50 focus:outline-none focus:ring-0 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent'
    >
      <Cross2Icon className='size-6' />
    </DialogPrimitive.Close>

    <div className='min-w-0 shrink grow truncate text-center'>{children}</div>

    {/** Create equal spacing */}
    <div className='size-6' />
  </div>
);
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
    {...props}
  />
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
