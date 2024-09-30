import { styled } from 'styled-components';
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
  ${small};

  color: ${props =>
    props.$disabled ? props.theme.color.text.muted : props.theme.color.text.secondary};
`;

const LabelText = styled.div<{ $disabled: boolean }>`
  ${strong};

  color: ${props =>
    props.$disabled ? props.theme.color.text.muted : props.theme.color.text.primary};
`;

export interface FormFieldProps {
  label: string;
  /**
   * Setting this to `true` will render the `<FormField />` as disabled, and
   * will also disable whatever input component you pass as children (if that
   * component uses the `useDisabled()` hook).
   *
   * Thus, you can simply set `disabled` on the `<FormField />`, and don't need
   * to _also_ set it on the child input component.
   */
  disabled?: boolean;
  helperText?: ReactNode;
  /**
   * The form control to render for this field, whether a `<TextInput />`,
   * `<SegmentedControl />`, etc.
   */
  children: ReactNode;
}

/**
 * A wrapper around a field in a form. Provides a standardized presentation for
 * any inputs, such as `<TextInput />`, `<SegmentedControl />`, etc.
 *
 * ```tsx
 * <FormField
 *   label="Field label"
 *   helperText="This is the helper text."
 *   disabled={disabled}
 * >
 *   <TextInput value={value} onChange={onChange} />
 * </FormField>
 * ```
 *
 * Note that, in the example above, you can simply pass the `disabled` prop to
 * `<FormField />`, and it will take care of disabling its child input component
 * via context (assuming the child input component uses the `useDisabled()`
 * hook).
 */
export const FormField = ({ label, disabled = false, helperText, children }: FormFieldProps) => (
  <Root>
    <LabelText $disabled={disabled}>{label}</LabelText>

    <DisabledContext.Provider value={disabled}>{children}</DisabledContext.Provider>

    {helperText && <HelperText $disabled={disabled}>{helperText}</HelperText>}
  </Root>
);
