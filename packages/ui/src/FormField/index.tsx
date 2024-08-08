import styled from 'styled-components';
import { small, strong } from '../utils/typography';
import { ReactNode } from 'react';
import { DisabledContext } from '../utils/DisabledContext';

const Root = styled.label`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing(2)};
  position: relative;
`;

const HelperText = styled.div<{ $disabled: boolean }>`
  color: ${props =>
    props.$disabled ? props.theme.color.text.muted : props.theme.color.text.secondary};

  ${small}
`;

const LabelText = styled.div<{ $disabled: boolean }>`
  ${strong}

  color: ${props =>
    props.$disabled ? props.theme.color.text.muted : props.theme.color.text.primary};
`;

export interface FormFieldProps {
  label: string;
  disabled?: boolean;
  helperText?: string;
  /**
   * The form control to render for this field, whether a `<TextInput />`,
   * `<SegmentedControl />`, etc.
   */
  children: ReactNode;
}

export const FormField = ({ label, disabled = false, helperText, children }: FormFieldProps) => (
  <Root>
    <LabelText $disabled={disabled}>{label}</LabelText>

    <DisabledContext.Provider value={disabled}>{children}</DisabledContext.Provider>

    {helperText && <HelperText $disabled={disabled}>{helperText}</HelperText>}
  </Root>
);
