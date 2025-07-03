import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { TableCell } from '@penumbra-zone/ui/TableCell';
import { Button } from '@penumbra-zone/ui/Button';
import { Text } from '@penumbra-zone/ui/Text';
import { useRegistry } from '@/shared/api/registry';
import { DisplayLP } from '../model/get-display-lps';
import { LiquidityRow } from './liquidity-row';
import Image from 'next/image';

interface GroupedLiquidityRowProps {
  pair: string;
  lps: DisplayLP[];
}

export const GroupedLiquidityRow = ({ pair, lps }: GroupedLiquidityRowProps) => {
  const [base, quote] = pair.split('/');
  const params = useParams<{
    baseSymbol: string;
    quoteSymbol: string;
  }>();
  const baseSymbol = params?.baseSymbol ?? '';
  const quoteSymbol = params?.quoteSymbol ?? '';
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleExpanded = () => setIsExpanded(!isExpanded);

  useEffect(() => {
    if (baseSymbol === base && quoteSymbol === quote) {
      setIsExpanded(true);
    }
  }, [baseSymbol, quoteSymbol, base, quote]);

  const { data: registry } = useRegistry();
  const baseAsset = registry
    .getAllAssets()
    .find((asset: { symbol: string }) => asset.symbol === base);
  const quoteAsset = registry
    .getAllAssets()
    .find((asset: { symbol: string }) => asset.symbol === quote);

  return (
    <>
      <div
        className={`col-span-10 grid cursor-pointer grid-cols-subgrid ${isExpanded ? 'bg-other-tonal-fill5' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <TableCell>
          <div className='relative mr-1 shrink-0 pr-2'>
            {baseAsset?.images[0]?.svg && (
              <Image
                className='relative z-10 h-4 w-4 rounded-full'
                src={baseAsset.images[0].svg}
                alt={baseAsset.symbol}
                width={16}
                height={16}
              />
            )}
            {quoteAsset?.images[0]?.svg && (
              <Image
                className={
                  baseAsset?.images[0]?.svg
                    ? 'absolute top-0 left-2 z-0 h-4 w-4 rounded-full'
                    : 'relative z-10 h-4 w-4 rounded-full'
                }
                src={quoteAsset.images[0].svg}
                alt={quoteAsset.symbol}
                width={16}
                height={16}
              />
            )}
          </div>
          <Text detailTechnical whitespace='nowrap'>
            {pair} ({lps.length})
          </Text>
        </TableCell>
        <TableCell>&nbsp;</TableCell>
        <TableCell>&nbsp;</TableCell>
        <TableCell>&nbsp;</TableCell>
        <TableCell>&nbsp;</TableCell>
        <TableCell>&nbsp;</TableCell>
        <TableCell>&nbsp;</TableCell>
        <TableCell>&nbsp;</TableCell>
        <TableCell>&nbsp;</TableCell>
        <TableCell justify='end'>
          <Button iconOnly icon={isExpanded ? ChevronUp : ChevronDown} onClick={toggleExpanded}>
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
        </TableCell>
      </div>

      {/* Group Content */}
      {isExpanded && lps.map((lp, index) => <LiquidityRow key={`${lp.date}${index}`} lp={lp} />)}
    </>
  );
};
