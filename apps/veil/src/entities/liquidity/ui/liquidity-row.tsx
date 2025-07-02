import { TableCell } from '@penumbra-zone/ui/TableCell';
import { Text } from '@penumbra-zone/ui/Text';
import { Button } from '@penumbra-zone/ui/Button';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { DisplayLP } from '../model/get-display-lps';
import { useState } from 'react';

interface LiquidityRowProps {
  lp: DisplayLP;
  isIndented?: boolean;
}

export const LiquidityRow = ({ lp }: LiquidityRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleExpanded = () => setIsExpanded(!isExpanded);

  return (
    <div
      className={`col-span-10 grid grid-cols-subgrid ${isExpanded ? 'bg-other-tonal-fill10' : 'bg-other-tonal-fill5'}`}
    >
      <TableCell cell>
        <Text xs whitespace='nowrap'>
          {lp.date}
        </Text>
      </TableCell>
      <TableCell cell>
        <Text xs whitespace='nowrap'>
          {lp.liquidityShape}
        </Text>
      </TableCell>
      <TableCell cell>
        <Text xs whitespace='nowrap'>
          {lp.status}
        </Text>
      </TableCell>
      <TableCell cell>
        <ValueViewComponent valueView={lp.minPrice} />
      </TableCell>
      <TableCell cell>
        <ValueViewComponent valueView={lp.maxPrice} />
      </TableCell>
      <TableCell cell>
        <ValueViewComponent valueView={lp.currentValue} />
      </TableCell>
      <TableCell cell>
        <ValueViewComponent valueView={lp.volume} />
      </TableCell>
      <TableCell cell>
        <ValueViewComponent valueView={lp.feesEarned} />
      </TableCell>
      <TableCell cell>
        <Text xs whitespace='nowrap'>
          {lp.pnl}
        </Text>
      </TableCell>
      <TableCell justify='end'>
        <Button iconOnly icon={isExpanded ? ChevronUp : ChevronDown} onClick={toggleExpanded}>
          &nbsp;
        </Button>
      </TableCell>
    </div>
  );
};
