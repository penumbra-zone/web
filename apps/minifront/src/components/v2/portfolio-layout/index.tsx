
import { PortfolioBalance } from '@penumbra-zone/ui/PortfolioBalance';
import { Card } from '@penumbra-zone/ui/Card';
import { AssetCard } from '@penumbra-zone/ui/AssetCard';

export const PortfolioLayout = () => {


  // Mock data - this would come from Prax client state
  const totalBalance = null;
  const currency = 'USDC';
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      {totalBalance && (
        <PortfolioBalance 
          balance={totalBalance} 
          currency={currency} 
        />
      )}
        
          <div className="flex flex-1 gap-4 w-full flex-col md:flex-row">
            {/* Asset Card - use the Card component directly */}
            <div className="flex-1">
              <AssetCard />
            </div>
            
            {/* Reserved space for Transactions, to be implemented later */}
            <div className="flex-1">
              <Card title="Your Recent Transactions">
                <div className="flex justify-center items-center h-[400px] text-text-secondary">
                  Transactions will be displayed here
                </div>
              </Card>
            </div>
          </div>
      </div>
  );
};
