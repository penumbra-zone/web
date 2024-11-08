import { MotionProp } from '../utils/MotionProp.ts';
import { ReactNode, useContext } from 'react';
import { ButtonGroup, ButtonGroupProps } from '../ButtonGroup';
import { DialogContext } from './Context.tsx';
import { EmptyContent } from './EmptyContent.tsx';
import { Display } from '../Display';
import { Grid } from '../Grid';
import { Title as RadixDialogTitle, Close as RadixDialogClose } from '@radix-ui/react-dialog';
import { Text } from '../Text';
import { Density } from '../Density';
import { Button } from '../Button';
import { X } from 'lucide-react';
import { styled } from 'styled-components';
import { motion } from 'framer-motion';

const FullHeightWrapper = styled.div`
  height: 100%;
  min-height: 100svh;
  max-height: 100lvh;
  position: relative;

  display: flex;
  align-items: center;
`;

const DialogContentCard = styled(motion.div)`
  position: relative;
  width: 100%;
  max-height: 75%;
  box-sizing: border-box;

  background: ${props => props.theme.color.other.dialogBackground};
  border: 1px solid ${props => props.theme.color.other.tonalStroke};
  border-radius: ${props => props.theme.borderRadius.xl};
  backdrop-filter: blur(${props => props.theme.blur.xl});

  display: flex;
  flex-direction: column;

  /**
   * We add 'pointer-events: auto' here so that clicks _inside_ the content card
   * work, even though the _outside_ clicks pass through to the underlying
   * '<Overlay />'.
   */
  pointer-events: auto;
`;

const DialogChildrenWrap = styled.div`
  overflow-y: auto;

  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing(6)};

  padding-bottom: ${props => props.theme.spacing(8)};
  padding-left: ${props => props.theme.spacing(6)};
  padding-right: ${props => props.theme.spacing(6)};
`;

const DialogHeader = styled.header`
  position: sticky;
  top: 0;

  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing(4)};
  color: ${props => props.theme.color.text.primary};

  padding-top: ${props => props.theme.spacing(8)};
  padding-bottom: ${props => props.theme.spacing(6)};
  padding-left: ${props => props.theme.spacing(6)};
  padding-right: ${props => props.theme.spacing(6)};
`;

/**
 * Opening the dialog focuses the first focusable element in the dialog. That's why the Close button
 * should be positioned absolutely and rendered as the last element in the dialog content.
 */
const DialogClose = styled.div`
  position: absolute;
  top: ${props => props.theme.spacing(8)};
  right: ${props => props.theme.spacing(6)};
`;

export interface DialogContentProps<IconOnlyButtonGroupProps extends boolean | undefined>
  extends MotionProp {
  children?: ReactNode;
  /** Renders the element after the dialog title. These elements will be sticky to the top of the dialog */
  headerChildren?: ReactNode;
  title: string;
  /**
   * If you want to render CTA buttons in the dialog footer, use
   * `buttonGroupProps`. The dialog will then render a `<ButtonGroup />` using
   * these props.
   */
  buttonGroupProps?: IconOnlyButtonGroupProps extends boolean
    ? ButtonGroupProps<IconOnlyButtonGroupProps>
    : undefined;
  /** @deprecated this prop will be removed in the future */
  zIndex?: number;
}

export const Content = <IconOnlyButtonGroupProps extends boolean | undefined>({
  children,
  headerChildren,
  title,
  buttonGroupProps,
  motion,
  zIndex,
}: DialogContentProps<IconOnlyButtonGroupProps>) => {
  const { showCloseButton } = useContext(DialogContext);

  return (
    <EmptyContent zIndex={zIndex}>
      <Display>
        <Grid container>
          <Grid mobile={0} tablet={2} desktop={3} xl={4} />

          <Grid mobile={12} tablet={8} desktop={6} xl={4}>
            <FullHeightWrapper>
              <DialogContentCard {...motion}>
                <DialogHeader>
                  <RadixDialogTitle asChild>
                    <Text xxl as='h2'>
                      {title}
                    </Text>
                  </RadixDialogTitle>
                  {headerChildren}
                </DialogHeader>

                <DialogChildrenWrap>
                  {children}

                  {buttonGroupProps && <ButtonGroup {...buttonGroupProps} column />}
                </DialogChildrenWrap>

                {showCloseButton && (
                  <Density compact>
                    <RadixDialogClose asChild>
                      <DialogClose>
                        <Button icon={X} iconOnly priority='secondary'>
                          Close
                        </Button>
                      </DialogClose>
                    </RadixDialogClose>
                  </Density>
                )}
              </DialogContentCard>
            </FullHeightWrapper>
          </Grid>

          <Grid mobile={0} tablet={2} desktop={3} xl={4} />
        </Grid>
      </Display>
    </EmptyContent>
  );
};
