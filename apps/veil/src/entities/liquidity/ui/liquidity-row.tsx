import { ChevronUp, ChevronDown, ArrowBigDownIcon, X } from 'lucide-react';
import { TableCell } from '@penumbra-zone/ui/TableCell';
import { Text } from '@penumbra-zone/ui/Text';
import { Button } from '@penumbra-zone/ui/Button';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { ThemeColor } from '@penumbra-zone/ui/theme';
import { DisplayLP } from '../model/get-display-lps';
import { useState } from 'react';
import { Density } from '@penumbra-zone/ui/Density';

interface LiquidityRowProps {
  lp: DisplayLP;
  isIndented?: boolean;
}

const statusColorMapping: Record<string, ThemeColor> = {
  'In range': 'success.light',
  'Out of range': 'destructive.light',
  Closed: 'text.secondary',
};

const getStatusColor = (status: string): ThemeColor => {
  return statusColorMapping[status] ?? 'text.secondary';
};

export const LiquidityRow = ({ lp }: LiquidityRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleExpanded = () => setIsExpanded(!isExpanded);

  return (
    <>
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
          <Text xs whitespace='nowrap' color={getStatusColor(lp.status)}>
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
          <Text
            xs
            whitespace='nowrap'
            color={lp.pnlPercentage >= 0 ? 'success.light' : 'destructive.light'}
          >
            {lp.pnlPercentage > 0 ? '+' : ''}
            {lp.pnlPercentage}%
          </Text>
        </TableCell>
        <TableCell justify='end'>
          {lp.status === 'Closed' ? (
            <Button
              iconOnly
              icon={ArrowBigDownIcon}
              actionType='success'
              priority='secondary'
              onClick={toggleExpanded}
            >
              &nbsp;
            </Button>
          ) : (
            <Button
              iconOnly
              icon={X}
              actionType='destructive'
              priority='secondary'
              onClick={toggleExpanded}
            >
              &nbsp;
            </Button>
          )}
          <Button iconOnly icon={isExpanded ? ChevronUp : ChevronDown} onClick={toggleExpanded}>
            &nbsp;
          </Button>
        </TableCell>
      </div>
      {isExpanded && (
        <Density compact>
          <div className={`col-span-10 grid grid-cols-subgrid bg-other-tonal-fill10`}>
            <TableCell>&nbsp;</TableCell>
            <TableCell>&nbsp;</TableCell>
            <TableCell>&nbsp;</TableCell>
            <TableCell>&nbsp;</TableCell>
            <TableCell>&nbsp;</TableCell>
            <TableCell cell>
              {/* TODO: replace with asset 1 & 2 */}
              <div className='flex flex-col gap-2'>
                <Density slim>
                  <ValueViewComponent valueView={lp.currentValue} />
                  <ValueViewComponent valueView={lp.currentValue} />
                </Density>
              </div>
            </TableCell>
            <TableCell cell>
              {/* TODO: replace with asset 1 & 2 */}
              <div className='flex flex-col gap-2'>
                <Density slim>
                  <ValueViewComponent valueView={lp.volume} />
                  <ValueViewComponent valueView={lp.volume} />
                </Density>
              </div>
            </TableCell>
            <TableCell cell>
              {/* TODO: replace with asset 1 & 2 */}
              <div className='flex flex-col gap-2'>
                <Density slim>
                  <ValueViewComponent valueView={lp.feesEarned} />
                  <ValueViewComponent valueView={lp.feesEarned} />
                </Density>
              </div>
            </TableCell>
            <TableCell>&nbsp;</TableCell>
            <TableCell>&nbsp;</TableCell>
          </div>
        </Density>
      )}
    </>
  );
};
