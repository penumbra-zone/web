import { describe, expect, it } from 'vitest';
import { Table } from '.';
import { render } from '@testing-library/react';
import { PenumbraUIProvider } from '../PenumbraUIProvider';

describe('<Table />', () => {
  it('renders a title if one is passed', () => {
    const { container } = render(
      <Table title='Table title'>
        <Table.Tbody />
      </Table>,
      { wrapper: PenumbraUIProvider },
    );

    expect(container).toHaveTextContent('Table title');
  });
});
