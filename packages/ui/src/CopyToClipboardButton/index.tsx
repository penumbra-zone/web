import { ButtonHTMLAttributes, useState } from 'react';
import { Copy, Check, LucideIcon } from 'lucide-react';
import { Button } from '../Button';

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

export interface CopyToClipboardButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The text that should be copied to the clipboard when the user presses this
   * button.
   */
  text: string;
}

/**
 * A simple icon button for copying some text to the clipboard. Use it alongside
 * text that the user may want to copy.
 */
export const CopyToClipboardButton = ({ text }: CopyToClipboardButtonProps) => {
  const { onClick, icon, label } = useClipboardButton(text);

  return (
    <Button type='button' iconOnly='adornment' icon={icon} onClick={onClick}>
      {label}
    </Button>
  );
};
