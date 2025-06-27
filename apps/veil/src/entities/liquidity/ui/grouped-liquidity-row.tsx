import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { TableCell } from '@penumbra-zone/ui/TableCell';
import { DisplayLP } from '../model/get-display-lps';
import { LiquidityRow } from './liquidity-row';

interface GroupedLiquidityRowProps {
  pair: string;
  lps: DisplayLP[];
}

export const GroupedLiquidityRow = ({ pair, lps }: GroupedLiquidityRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  return (
    <>
      <div className='col-span-10 grid grid-cols-subgrid' onClick={toggleExpanded}>
        <TableCell>{pair}</TableCell>
        <TableCell>&nbsp;</TableCell>
        <TableCell>&nbsp;</TableCell>
        <TableCell>&nbsp;</TableCell>
        <TableCell>&nbsp;</TableCell>
        <TableCell>&nbsp;</TableCell>
        <TableCell>&nbsp;</TableCell>
        <TableCell>&nbsp;</TableCell>
        <TableCell>&nbsp;</TableCell>
        <TableCell>
          <ChevronRight
            size={16}
            className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          />
        </TableCell>
      </div>

      {/* Group Content */}
      {isExpanded &&
        lps.map((lp, index) => <LiquidityRow key={`${lp.date}${index}`} lp={lp} isIndented />)}
    </>
  );
};
