import { Title as RadixDialogTitle, Close as RadixDialogClose } from '@radix-ui/react-dialog';
import { ReactNode, useContext } from 'react';
import { X } from 'lucide-react';
import { DialogContext } from './Context.tsx';
import { EmptyContent } from './EmptyContent.tsx';
import { Display } from '../Display';
import { Grid } from '../Grid';
import { Text } from '../Text';
import { Density } from '../Density';
import { Button } from '../Button';

export interface DialogContentProps {
  children?: ReactNode;
  /** Renders the element after the dialog title. These elements will be sticky to the top of the dialog */
  headerChildren?: ReactNode;
  title: string;
  /** Buttons rendered in the footer of a dialog */
  buttons?: ReactNode;
  /** @deprecated this prop will be removed in the future */
  zIndex?: number;
}

export const Content = ({
  children,
  headerChildren,
  title,
  buttons,
  zIndex,
}: DialogContentProps) => {
  const { showCloseButton } = useContext(DialogContext);

  return (
    <EmptyContent zIndex={zIndex}>
      <Display>
        <Grid container>
          <Grid mobile={0} tablet={2} desktop={3} xl={4} />

          <Grid mobile={12} tablet={8} desktop={6} xl={4}>
            <div className='relative flex h-full max-h-lvh min-h-svh items-center'>
              <div className='pointer-events-auto relative box-border flex max-h-[75%] w-full flex-col rounded-xl border border-solid border-other-tonalStroke bg-other-dialogBackground backdrop-blur-xl'>
                <header className='sticky top-0 flex flex-col gap-2 px-6 pb-6 pt-8 text-text-primary'>
                  <RadixDialogTitle asChild>
                    <Text xxl as='h2'>
                      {title}
                    </Text>
                  </RadixDialogTitle>
                  {headerChildren}
                </header>

                <div className='flex flex-col gap-6 overflow-y-auto px-6 pb-8'>{children}</div>

                {buttons && <div className='flex flex-col gap-2'>{buttons}</div>}

                {/**
                 * Opening the dialog focuses the first focusable element in the dialog. That's why the Close button
                 * should be positioned absolutely and rendered as the last element in the dialog content.
                 */}
                {showCloseButton && (
                  <Density compact>
                    <RadixDialogClose asChild>
                      <div className='absolute right-6 top-8'>
                        <Button icon={X} iconOnly priority='secondary'>
                          Close
                        </Button>
                      </div>
                    </RadixDialogClose>
                  </Density>
                )}
              </div>
            </div>
          </Grid>

          <Grid mobile={0} tablet={2} desktop={3} xl={4} />
        </Grid>
      </Display>
    </EmptyContent>
  );
};
