import { useState } from 'react';
import Link from 'next/link';
import { Text } from '@penumbra-zone/ui/Text';
import { Button } from '@penumbra-zone/ui/Button';
import { Dialog } from '@penumbra-zone/ui/Dialog';
import { Density } from '@penumbra-zone/ui/Density';
import { useStakingTokenMetadata } from '@/shared/api/registry';
import { getTradePairPath } from '@/shared/const/pages';

export interface ProvideLiquidityButtonProps {
  symbol: string;
  primary: boolean;
}

export const ProvideLiquidityButton = ({ symbol, primary }: ProvideLiquidityButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const umMetadata = useStakingTokenMetadata();
  const link = getTradePairPath(umMetadata.data.symbol, symbol, {
    highlight: 'liquidity',
  });

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!primary) {
    return (
      <>
        <Button actionType='default' density='slim' onClick={() => setIsOpen(true)}>
          Provide Liquidity
        </Button>

        <Dialog isOpen={isOpen} onClose={handleClose}>
          <Dialog.Content
            title='LP Rewards Not Guaranteed'
            buttons={
              <div className='flex items-center gap-2 px-6 pb-8 [&>*]:w-1/2'>
                <Density sparse>
                  <Button actionType='default' onClick={handleClose}>
                    Cancel
                  </Button>
                  <Link href={link}>
                    <Button actionType='accent'>Continue</Button>
                  </Link>
                </Density>
              </div>
            }
          >
            <Text>
              This asset is currently below the 5% incentive threshold, and providing liquidity may
              not result in earning rewards this epoch.
            </Text>
          </Dialog.Content>
        </Dialog>
      </>
    );
  }

  return (
    <Link href={link}>
      <Button actionType='accent' density='slim'>
        Provide Liquidity
      </Button>
    </Link>
  );
};
