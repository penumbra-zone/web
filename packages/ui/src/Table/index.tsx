import { ReactNode } from 'react';
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

const Tbody = styled.tbody``;

const Tr = styled.tr``;

const cell = css`
  padding-left: ${props => props.theme.spacing(3)};
  padding-right: ${props => props.theme.spacing(3)};

  padding-top: ${props => props.theme.spacing(4)};
  padding-bottom: ${props => props.theme.spacing(4)};
`;

const Th = styled.th`
  border-bottom: 1px solid ${props => props.theme.color.other.tonalStroke};
  text-align: left;
  color: ${props => props.theme.color.text.secondary};

  ${tableHeading}
  ${cell}
`;

const Td = styled.td`
  border-bottom: 1px solid ${props => props.theme.color.other.tonalStroke};
  color: ${props => props.theme.color.text.primary};

  tbody > ${Tr}:last-child > & {
    border-bottom: none;
  }

  ${tableItem}
  ${cell}
`;

/**
 * Utility interface to be used below to ensure that only one table element is
 * used on a component at a time.
 */
interface NeverTableTypes {
  thead?: never;
  tbody?: never;
  tfoot?: never;
  tr?: never;
  th?: never;
  td?: never;
}

type TableType =
  | (Omit<NeverTableTypes, 'thead'> & {
      /** Renders a `<thead />` element. */
      thead: true;
      children: ReactNode;
    })
  | (Omit<NeverTableTypes, 'tbody'> & {
      /** Renders a `<tbody />` element. */
      tbody: true;
      children: ReactNode;
    })
  | (Omit<NeverTableTypes, 'tfoot'> & {
      /** Renders a `<tfoot />` element. */
      tfoot: true;
      children: ReactNode;
    })
  | (Omit<NeverTableTypes, 'tr'> & {
      /** Renders a `<tr />` element. */
      tr: true;
      children: ReactNode;
    })
  | (Omit<NeverTableTypes, 'th'> & {
      /** Renders a `<th />` element. */
      th: true;
      children?: ReactNode;
    })
  | (Omit<NeverTableTypes, 'td'> & {
      /** Renders a `<td />` element. */
      td: true;
      children?: ReactNode;
    })
  | (NeverTableTypes & { children: ReactNode }); // <table> component

export type TableProps = TableType;

export const Table = (props: TableProps) => {
  if (props.thead) {
    return <thead {...props} />;
  }
  if (props.tbody) {
    return <Tbody {...props} />;
  }
  if (props.tfoot) {
    return <tfoot {...props} />;
  }
  if (props.tr) {
    return <Tr {...props} />;
  }
  if (props.th) {
    return <Th {...props} />;
  }
  if (props.td) {
    return <Td {...props} />;
  }

  return <StyledTable cellSpacing={0} cellPadding={0} {...props} />;
};
