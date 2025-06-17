import Link from 'next/link';
import { Button } from '@penumbra-zone/ui/Button';
import { useStakingTokenMetadata } from '@/shared/api/registry';
import { getTradePairPath } from '@/shared/const/pages';

export interface ProvideLiquidityButtonProps {
  symbol: string;
}

export const ProvideLiquidityButton = ({ symbol }: ProvideLiquidityButtonProps) => {
  const umMetadata = useStakingTokenMetadata();
  const link = getTradePairPath(umMetadata.data.symbol, symbol, {
    highlight: 'liquidity',
  });

  return (
    <Link href={link}>
      <Button actionType='default' density='slim'>
        Provide Liquidity
      </Button>
    </Link>
  );
};
