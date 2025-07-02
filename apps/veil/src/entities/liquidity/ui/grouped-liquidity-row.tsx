import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { TableCell } from '@penumbra-zone/ui/TableCell';
import { Button } from '@penumbra-zone/ui/Button';
import { Text } from '@penumbra-zone/ui/Text';
import { DisplayLP } from '../model/get-display-lps';
import { LiquidityRow } from './liquidity-row';

interface GroupedLiquidityRowProps {
  pair: string;
  lps: DisplayLP[];
}

export const GroupedLiquidityRow = ({ pair, lps }: GroupedLiquidityRowProps) => {
  const params = useParams<{
    baseSymbol: string;
    quoteSymbol: string;
  }>();
  const baseSymbol = params?.baseSymbol ?? '';
  const quoteSymbol = params?.quoteSymbol ?? '';
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleExpanded = () => setIsExpanded(!isExpanded);

  useEffect(() => {
    const [base, quote] = pair.split('/');
    if (baseSymbol === base && quoteSymbol === quote) {
      setIsExpanded(true);
    }
  }, [baseSymbol, quoteSymbol, pair]);

  return (
    <>
      <div
        className={`col-span-10 grid cursor-pointer grid-cols-subgrid ${isExpanded ? 'bg-other-tonal-fill5' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <TableCell>
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
            &nbsp;
          </Button>
        </TableCell>
      </div>

      {/* Group Content */}
      {isExpanded && lps.map((lp, index) => <LiquidityRow key={`${lp.date}${index}`} lp={lp} />)}
    </>
  );
};
