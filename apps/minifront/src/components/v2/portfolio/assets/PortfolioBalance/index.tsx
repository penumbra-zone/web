import { Card } from '@penumbra-zone/ui';
import { Text } from '@penumbra-zone/ui';

export interface PortfolioBalanceProps {
  balance: string;
  currency: string;
}

/**
 * `PortfolioBalance` displays a user's total portfolio balance with a currency (default USDC).
 *
 */
export const PortfolioBalance = ({ balance, currency }: PortfolioBalanceProps) => {
  return (
    <div className='w-full'>
      <div className='flex flex-col py-3'>
        <Card title='Your Total Balance'>
          <div className='flex h-14 gap-3 items-center'>
            <Text h4 color='text.primary'>
              ${balance}
            </Text>
            <Text h4 color='text.secondary'>
              {currency}
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
}; 