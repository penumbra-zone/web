import { PropsWithChildren, ReactNode } from 'react';
import cn from 'clsx';
import { tableHeading, tableItem } from '../utils/typography';
import { Density, useDensity } from '../utils/density';
import { ConditionalWrap } from '../ConditionalWrap';

export interface TableProps {
  /** Content that will appear above the table. */
  title?: ReactNode;
  children: ReactNode;
  /** Which CSS `table-layout` property to use. */
  tableLayout?: 'fixed' | 'auto';
}

/**
 * A styled HTML table.
 *
 * To build a table, you only need to import the `<Table />` component. All
 * other components are properties on `Table`.
 *
 * ```tsx
 * <Table>
 *   <Table.Thead>
 *     <Table.Tr>
 *       <Table.Th width="25%" hAlign="right">Header cell</Table.Th>
 *       <Table.Th width="75%">Header cell 2</Table.Th>
 *     </Table.Tr>
 *   </Table.Thead>
 *   <Table.Tbody>
 *     <Table.Tr>
 *       <Table.Td hAlign="right">Body cell</Table.Td>
 *       <Table.Td vAlign="middle">Body cell 2</Table.Td>
 *     </Table.Tr>
 *   </Table.Tbody>
 * </Table>
 * ```
 *
 * By design, `<Table.* />` elements have limited props. No styling or
 * customization is permitted. This ensures that all tables look consistent
 * throughout the Penumbra UI.
 *
 * To render title content above the table, pass a `title` prop:
 *
 * ```tsx
 * <Table title="Here's the table title">
 *   ...
 * </Table>
 *
 * // or...
 *
 * <Table title={<div>Here is some rich table title content</div>}>
 *   ...
 * </Table>
 * ```
 */
export const Table = ({ title, children, tableLayout }: TableProps) => (
  <ConditionalWrap
    if={!!title}
    then={children => (
      <div className='flex flex-col'>
        <div className='p-3'>{title}</div>
        {children}
      </div>
    )}
  >
    <table
      cellSpacing={0}
      cellPadding={0}
      className={cn(
        'w-full bg-other-tonalFill5 pl-3 pr-3 rounded-sm',
        tableLayout === 'fixed' ? 'table-fixed' : 'table-auto',
      )}
    >
      {children}
    </table>
  </ConditionalWrap>
);

const Thead = ({ children }: PropsWithChildren) => <thead>{children}</thead>;
Table.Thead = Thead;

const Tbody = ({ children }: PropsWithChildren) => <tbody>{children}</tbody>;
Table.Tbody = Tbody;

const Tr = ({ children }: PropsWithChildren) => (
  <tr className='[&>td:last-child]:border-b-0'>{children}</tr>
);
Table.Tr = Tr;

type HAlign = 'left' | 'center' | 'right';
type VAlign = 'top' | 'middle' | 'bottom';

const getCell = (density: Density) =>
  cn('box-border', 'pl-3 pr-3', density === 'sparse' ? 'pt-4 pb-4' : 'pt-3 pb-3');

const Th = ({
  children,
  colSpan,
  hAlign,
  vAlign,
  width,
}: PropsWithChildren<{
  colSpan?: number;
  /** A CSS `width` value to use for this cell. */
  width?: string;
  /** Controls the CSS `text-align` property for this cell. */
  hAlign?: HAlign;
  /** Controls the CSS `vertical-align` property for this cell. */
  vAlign?: VAlign;
}>) => {
  const density = useDensity();

  return (
    <th
      colSpan={colSpan}
      style={{ width, textAlign: hAlign, verticalAlign: vAlign }}
      className={cn(
        'border-b border-solid border-other-tonalStroke',
        'text-left text-text-secondary',
        tableHeading,
        getCell(density),
      )}
    >
      {children}
    </th>
  );
};
Table.Th = Th;

const Td = ({
  children,
  colSpan,
  hAlign,
  vAlign,
  width,
}: PropsWithChildren<{
  colSpan?: number;
  /** A CSS `width` value to use for this cell. */
  width?: string;
  /** Controls the CSS `text-align` property for this cell. */
  hAlign?: HAlign;
  /** Controls the CSS `vertical-align` property for this cell. */
  vAlign?: VAlign;
}>) => {
  const density = useDensity();

  return (
    <td
      colSpan={colSpan}
      style={{ width, textAlign: hAlign, verticalAlign: vAlign }}
      className={cn(
        'text-text-primary border-b border-solid border-other-tonalStroke',
        tableItem,
        getCell(density),
      )}
    >
      {children}
    </td>
  );
};
Table.Td = Td;
