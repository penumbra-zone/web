import { Card } from '@penumbra-zone/ui/Card';
import { Text } from '@penumbra-zone/ui/Text';

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
          <div className='flex h-14 items-center gap-3'>
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
