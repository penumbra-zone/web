import { PropsWithChildren, ReactNode } from 'react';
import styled, { css } from 'styled-components';
import { tableHeading, tableItem } from '../utils/typography';
import { Density } from '../types/Density';
import { useDensity } from '../hooks/useDensity';
import { ConditionalWrap } from '../utils/ConditionalWrap';

const FIVE_PERCENT_OPACITY_IN_HEX = '0d';

// So named to avoid naming conflicts with `<Table />`
const StyledTable = styled.table`
  width: 100%;
  background-color: ${props => props.theme.color.neutral.contrast + FIVE_PERCENT_OPACITY_IN_HEX};
  padding-left: ${props => props.theme.spacing(3)};
  padding-right: ${props => props.theme.spacing(3)};
  border-radius: ${props => props.theme.borderRadius.lg};
`;

const TitleAndTableWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const TitleWrapper = styled.div`
  padding: ${props => props.theme.spacing(3)};
`;

export interface TableProps {
  /** Content that will appear above the table. */
  title?: ReactNode;
  children: ReactNode;
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
export const Table = ({ title, ...props }: TableProps) => (
  <ConditionalWrap
    if={!!title}
    then={children => (
      <TitleAndTableWrapper>
        <TitleWrapper>{title}</TitleWrapper>
        {children}
      </TitleAndTableWrapper>
    )}
  >
    <StyledTable cellSpacing={0} cellPadding={0} {...props} />
  </ConditionalWrap>
);

const Thead = ({ children }: PropsWithChildren) => <thead>{children}</thead>;
Table.Thead = Thead;

const StyledTbody = styled.tbody``; // Needs to be a styled component for `StyledTd` below
const Tbody = ({ children }: PropsWithChildren) => <StyledTbody>{children}</StyledTbody>;
Table.Tbody = Tbody;

const StyledTr = styled.tr``; // Needs to be a styled component for `StyledTd` below
const Tr = ({ children }: PropsWithChildren) => <StyledTr>{children}</StyledTr>;
Table.Tr = Tr;

type HAlign = 'left' | 'center' | 'right';
type VAlign = 'top' | 'middle' | 'bottom';
interface CellStyledProps {
  $density: Density;
  $width?: string;
  $hAlign?: HAlign;
  $vAlign?: VAlign;
}

const cell = css<CellStyledProps>`
  box-sizing: border-box;

  padding-left: ${props => props.theme.spacing(3)};
  padding-right: ${props => props.theme.spacing(3)};

  padding-top: ${props => props.theme.spacing(props.$density === 'sparse' ? 4 : 3)};
  padding-bottom: ${props => props.theme.spacing(props.$density === 'sparse' ? 4 : 3)};

  ${props => props.$width && `width: ${props.$width};`}
  ${props => props.$hAlign && `text-align: ${props.$hAlign};`};
  ${props => props.$vAlign && `vertical-align: ${props.$vAlign};`};
`;

const StyledTh = styled.th<CellStyledProps>`
  border-bottom: 1px solid ${props => props.theme.color.other.tonalStroke};
  text-align: left;
  color: ${props => props.theme.color.text.secondary};

  ${tableHeading}
  ${cell}
`;
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
    <StyledTh colSpan={colSpan} $width={width} $hAlign={hAlign} $vAlign={vAlign} $density={density}>
      {children}
    </StyledTh>
  );
};
Table.Th = Th;

const StyledTd = styled.td<CellStyledProps>`
  border-bottom: 1px solid ${props => props.theme.color.other.tonalStroke};
  color: ${props => props.theme.color.text.primary};

  ${StyledTbody} > ${StyledTr}:last-child > & {
    border-bottom: none;
  }

  ${tableItem}
  ${cell}
`;
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
    <StyledTd colSpan={colSpan} $width={width} $hAlign={hAlign} $vAlign={vAlign} $density={density}>
      {children}
    </StyledTd>
  );
};
Table.Td = Td;
