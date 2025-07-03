import { useState } from 'react';
import { Button } from '@penumbra-zone/ui/Button';
import { MappedGauge } from '../../../server/previous-epochs';
import { VoteDialogueSelector } from '../../vote-dialog';
import { VotingAbility } from '@/pages/tournament/api/use-voting-info';

export interface VoteButtonProps {
  value: MappedGauge;
  ability: VotingAbility;
}

export const VoteButton = ({ value, ability }: VoteButtonProps) => {
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

      <VoteDialogueSelector
        ability={ability}
        defaultValue={value}
        isOpen={isOpen}
        onClose={close}
      />
    </>
  );
};
