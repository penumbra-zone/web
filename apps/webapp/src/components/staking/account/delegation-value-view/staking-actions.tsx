import { Button } from '@penumbra-zone/ui';

/**
 * Renders Delegate/Undelegate buttons for a validator.
 */
export const StakingActions = ({
  canDelegate,
  canUndelegate,
}: {
  /**
   * Whether the user can delegate to this validator (i.e., whether the user has
   * a nonzero balance of the staking token with which to stake in this
   * validator).
   */
  canDelegate: boolean;
  /**
   * Whether the user can undelegate from this validator (i.e., whether the user
   * has a nonzero balance of the delegation token for this validator).
   */
  canUndelegate: boolean;
}) => {
  const handleClickAction = () => alert('Not yet implemented; coming soon!');

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex gap-2'>
        <Button className='px-4' disabled={!canDelegate} onClick={handleClickAction}>
          Delegate
        </Button>
        <Button
          variant='secondary'
          className='px-4'
          disabled={!canUndelegate}
          onClick={handleClickAction}
        >
          Undelegate
        </Button>
      </div>
    </div>
  );
};
