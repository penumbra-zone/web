import { InfoButton } from '../../shared/ui/info-button';
import { ReactNode } from 'react';

export interface TransactionsCardTitleProps {
  /**
   * Optional content to display at the end of the title row
   */
  endContent?: ReactNode;
  /**
   * Whether to show the InfoButton
   */
  showInfoButton?: boolean;
}

export const TransactionsCardTitle: React.FC<TransactionsCardTitleProps> = ({
  endContent,
  showInfoButton = true,
}) => {
  return (
    <div className='flex items-center justify-between'>
      <span>Your Recent Transactions</span>
      <div className='flex items-center gap-2'>
        {endContent}
        {showInfoButton && <InfoButton />}
      </div>
    </div>
  );
};
