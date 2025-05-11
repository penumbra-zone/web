import { useState } from 'react';
import { Button } from '@penumbra-zone/ui/Button';
import { MappedGauge } from '../../../server/previous-epochs';
import { VoteDialogueSelector } from '../../vote-dialog';

export interface VoteButtonProps {
  value: MappedGauge;
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
