import { Text } from '../Text';

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
        <div className='flex justify-between items-center'>
          <Text large color='text.secondary'>
            Your Total Balance
          </Text>
        </div>
        <div
          className='flex flex-col p-3 mt-3 self-stretch'
          style={{
            background:
              'var(--Gradient-Card-Background, linear-gradient(136deg, var(--other-card-background-stop-0, rgba(250, 250, 250, 0.10)) 6.32%, var(--other-card-background-stop-80, rgba(250, 250, 250, 0.01)) 75.55%))',
            backdropFilter: 'blur(16px)',
            borderRadius: '16px',
          }}
        >
          <div className='flex flex-col justify-center h-14 self-stretch'>
            <div className='flex items-baseline'>
              <div style={{ fontFamily: '"Work Sans", sans-serif' }}>
                <Text h4>${balance}</Text>
              </div>
              <div className='ml-2' style={{ fontFamily: '"Work Sans", sans-serif' }}>
                <Text h4 color='text.secondary'>
                  {currency}
                </Text>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
