import { useState } from 'react';
import { ClipboardCopy, Check } from 'lucide-react';

interface CopyToClipboardProps {
  text: string;
  buttonAriaLabel?: string;
}

export const CopyToClipboard: React.FC<CopyToClipboardProps> = ({
  text,
  buttonAriaLabel = 'Copy to clipboard',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <button
      onClick={() => void handleCopy()}
      className='p-1 text-muted-foreground transition-colors hover:text-foreground'
      aria-label={copied ? 'Copied!' : buttonAriaLabel}
    >
      {copied ? <Check className='size-3.5' /> : <ClipboardCopy className='size-3.5' />}
    </button>
  );
};
