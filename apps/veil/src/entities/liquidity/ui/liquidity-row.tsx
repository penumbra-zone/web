import { TableCell } from '@penumbra-zone/ui/TableCell';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { DisplayLP } from '../model/get-display-lps';

interface LiquidityRowProps {
  lp: DisplayLP;
  isIndented?: boolean;
}

export const LiquidityRow = ({ lp, isIndented = false }: LiquidityRowProps) => {
  return (
    <div className='col-span-10 grid grid-cols-subgrid'>
      <TableCell>
        {isIndented && <div className='pl-8'>{lp.date}</div>}
        {!isIndented && lp.date}
      </TableCell>
      <TableCell>{lp.liquidityShape}</TableCell>
      <TableCell>{lp.status}</TableCell>
      <TableCell>
        <ValueViewComponent valueView={lp.minPrice} />
      </TableCell>
      <TableCell>
        <ValueViewComponent valueView={lp.maxPrice} />
      </TableCell>
      <TableCell>
        <ValueViewComponent valueView={lp.currentValue} />
      </TableCell>
      <TableCell>
        <ValueViewComponent valueView={lp.volume} />
      </TableCell>
      <TableCell>
        <ValueViewComponent valueView={lp.feesEarned} />
      </TableCell>
      <TableCell>{lp.pnl}</TableCell>
      <TableCell>&nbsp;</TableCell>
    </div>
  );
};
