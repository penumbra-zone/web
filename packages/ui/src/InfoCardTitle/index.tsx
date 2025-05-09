import { ReactNode } from 'react';
import { Button } from '../Button';
import { Dialog } from '../Dialog';
import { Text } from '../Text';
import { ShieldQuestion } from 'lucide-react';

export interface InfoCardTitleProps {
  /**
   * The title text to display
   */
  title: ReactNode;
  /**
   * The content to display in the dialog
   */
  dialogContent: ReactNode;
  /**
   * Optional custom dialog title (defaults to string title prop)
   */
  dialogTitle?: string;
  /**
   * Optional additional classNames for the container
   */
  className?: string;
}

/**
 * InfoCardTitle component displays a title with an info button that opens a dialog with additional information.
 * Similar to the AssetsCardTitle and TransactionsCardTitle in minifront.
 */
export const InfoCardTitle = ({
  title,
  dialogContent,
  dialogTitle,
  className = '',
}: InfoCardTitleProps) => {
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {title}
      <Dialog>
        <Dialog.Trigger asChild>
          <Button
            icon={ShieldQuestion} 
            iconOnly="adornment"
            actionType="default"  
            priority="secondary"
            density="slim"
          >
            Information
          </Button>
        </Dialog.Trigger>
        <Dialog.Content title={dialogTitle ?? (typeof title === 'string' ? title : 'Information')}>
          {typeof dialogContent === 'string' ? (
            <Text>{dialogContent}</Text>
          ) : (
            dialogContent
          )}
        </Dialog.Content>
      </Dialog>
    </div>
  );
}; 