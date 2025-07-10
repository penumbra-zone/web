import Link from 'next/link';
import { MouseEventHandler } from 'react';
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

  const isDisabled = !symbol;
  const onClick: MouseEventHandler<HTMLAnchorElement> = event => {
    if (isDisabled) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  return (
    <Link href={link} onClick={onClick}>
      <Button actionType='default' density='slim' disabled={isDisabled}>
        Provide Liquidity
      </Button>
    </Link>
  );
};
