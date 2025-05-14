import { ReactNode } from 'react';
import { Card } from '../Card';
import { AssetList } from './AssetList';
import { AccountMock, mockAccounts } from './mock';
import { InfoButton } from '../InfoButton';

export interface AssetCardProps {
  /**
   * Title of the card
   */
  title?: string;
  /**
   * List of accounts with assets
   */
  accounts?: AccountMock[];
  /**
   * Optional header action component
   */
  headerAction?: ReactNode;
  /**
   * Optional content to display at the end of the title row
   * This is useful for displaying icons, buttons, or other elements
   * alongside the title
   */
  /**
   * Whether to show the InfoButton
   * When true, the InfoButton will be displayed next to the title
   */
  showInfoButton?: boolean;
}

/**
 * AssetCard component displays a list of assets grouped by accounts.
 * It follows the Penumbra design system and uses the Card component as a container.
 * 
 * By default, it shows an InfoButton that provides information about the shielded portfolio.
 */
export const AssetCard = ({ 
  title = 'Your Assets', 
  accounts = mockAccounts,
  headerAction,
  showInfoButton = true,
}: AssetCardProps) => {
  // Use InfoButton as endContent if showInfoButton is true and no custom endContent is provided
  const finalEndContent = showInfoButton ? <InfoButton /> : undefined


  return (
      <Card 
        title={title} 
        headerAction={headerAction}
        endContent={finalEndContent}
      >
        <AssetList accounts={accounts} />
      </Card>
  );
}; 

