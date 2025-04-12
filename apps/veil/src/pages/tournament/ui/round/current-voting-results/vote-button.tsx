import { useState } from 'react';
import { Button } from '@penumbra-zone/ui/Button';
import { VoteDialogueSelector } from '@/pages/tournament/ui/vote-dialogue';

export interface VoteButtonProps {
  /** A symbol to vote for */
  value: string;
}

export const VoteButton = ({ value }: VoteButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => {
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Button actionType='default' density='slim' onClick={open}>
        Vote
      </Button>

      <VoteDialogueSelector defaultValue={value} isOpen={isOpen} onClose={close} />
    </>
  );
};
