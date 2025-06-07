import { useState } from 'react';
import { Copy, Check, LucideIcon } from 'lucide-react';
import { Button } from '../Button';
import { useDensity } from '../utils/density';

const useClipboardButton = (text: string) => {
  const [icon, setIcon] = useState<LucideIcon>(Copy);
  const [label, setLabel] = useState('Copy');

  const onClick = () => {
    setIcon(Check);
    setLabel('Copied');
    setTimeout(() => {
      setIcon(Copy);
      setLabel('Copy');
    }, 2000);
    void navigator.clipboard.writeText(text);
  };

  return { onClick, icon, label };
};

export interface CopyToClipboardButtonProps {
  /**
   * The text that should be copied to the clipboard when the user presses this
   * button.
   */
  text: string;
  disabled?: boolean;
}

/**
 * A simple icon button for copying some text to the clipboard. Use it alongside
 * text that the user may want to copy.
 *
 * The button's size is determined by the current density context. Use the `<Density />`
 * component to control the density:
 *
 * ```tsx
 * <Density compact>
 *   <CopyToClipboardButton text="Copy this text" />
 * </Density>
 * ```
 */
export const CopyToClipboardButton = ({ text, disabled = false }: CopyToClipboardButtonProps) => {
  const { onClick, icon, label } = useClipboardButton(text);
  const density = useDensity();

  return (
    <Button
      type='button'
      iconOnly='adornment'
      icon={icon}
      onClick={onClick}
      disabled={disabled}
      density={density}
    >
      {label}
    </Button>
  );
};
