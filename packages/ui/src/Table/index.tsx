import { PropsWithChildren, ReactNode } from 'react';
import styled, { css } from 'styled-components';
import { tableHeading, tableItem } from '../utils/typography';

const FIVE_PERCENT_OPACITY_IN_HEX = '0d';

// So named to avoid naming conflicts with `<Table />`
const StyledTable = styled.table`
  width: 100%;
  background-color: ${props => props.theme.color.neutral.contrast + FIVE_PERCENT_OPACITY_IN_HEX};
  padding-left: ${props => props.theme.spacing(3)};
  padding-right: ${props => props.theme.spacing(3)};
  border-radius: ${props => props.theme.borderRadius.lg};
`;

export interface TableProps {
  children: ReactNode;
}

export const Table = (props: TableProps) => {
  return <StyledTable cellSpacing={0} cellPadding={0} {...props} />;
};

const Thead = ({ children }: PropsWithChildren) => <thead>{children}</thead>;
Table.Thead = Thead;

const StyledTbody = styled.tbody``; // Needs to be a styled component for `StyledTd` below
const Tbody = ({ children }: PropsWithChildren) => <StyledTbody>{children}</StyledTbody>;
Table.Tbody = Tbody;

const Tfoot = ({ children }: PropsWithChildren) => <tfoot>{children}</tfoot>;
Table.Tfoot = Tfoot;

const StyledTr = styled.tr``; // Needs to be a styled component for `StyledTd` below
const Tr = ({ children }: PropsWithChildren) => <StyledTr>{children}</StyledTr>;
Table.Tr = Tr;

const cell = css`
  padding-left: ${props => props.theme.spacing(3)};
  padding-right: ${props => props.theme.spacing(3)};

  padding-top: ${props => props.theme.spacing(4)};
  padding-bottom: ${props => props.theme.spacing(4)};
`;

const StyledTh = styled.th`
  border-bottom: 1px solid ${props => props.theme.color.other.tonalStroke};
  text-align: left;
  color: ${props => props.theme.color.text.secondary};

  ${tableHeading}
  ${cell}
`;
const Th = ({ children }: PropsWithChildren) => <StyledTh>{children}</StyledTh>;
Table.Th = Th;

const StyledTd = styled.td`
  border-bottom: 1px solid ${props => props.theme.color.other.tonalStroke};
  color: ${props => props.theme.color.text.primary};

  ${StyledTbody} > ${StyledTr}:last-child > & {
    border-bottom: none;
  }

  ${tableItem}
  ${cell}
`;
const Td = ({ children }: PropsWithChildren) => <StyledTd>{children}</StyledTd>;
Table.Td = Td;
