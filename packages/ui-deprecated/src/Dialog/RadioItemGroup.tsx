import { RadioGroup as RadixRadioGroup, RadioGroupProps } from '@radix-ui/react-radio-group';

export type DialogRadioGroupProps = Omit<RadioGroupProps, 'asChild'>;

/**
 * `Dialog.RadioGroup` – a wrapper around the list of `Dialog.RadioItem` that controls
 * the selection of the radio items. Doesn't have any UI or HTML elements, – provide your own styles
 * as children of this component.
 */
export const RadioGroup = (props: DialogRadioGroupProps) => {
  return <RadixRadioGroup {...props} asChild />;
};
