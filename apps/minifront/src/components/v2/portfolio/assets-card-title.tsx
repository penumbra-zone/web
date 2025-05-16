import React from 'react';
import { InfoButton } from '@penumbra-zone/ui/InfoButton';
import { ReactNode } from 'react';

export interface AssetsCardTitleProps {
  /**
   * Optional content to display at the end of the title row
   */
  endContent?: ReactNode;
  /**
   * Whether to show the InfoButton
   */
  showInfoButton?: boolean;
}

export const AssetsCardTitle: React.FC<AssetsCardTitleProps> = ({
  endContent,
  showInfoButton = true,
}) => {
  return (
    <div className="flex justify-between items-center">
      <span>Your Assets</span>
      <div className="flex items-center gap-2">
        {endContent}
        {showInfoButton && <InfoButton />}
      </div>
    </div>
  );
};
