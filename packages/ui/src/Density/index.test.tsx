import { describe, expect, it } from 'vitest';
import { Density } from '.';
import { useDensity } from '../hooks/useDensity';
import { render } from '@testing-library/react';

const MockUseDensityConsumerComponent = () => {
  const density = useDensity();

  return <>{density}</>;
};

describe('<Density />', () => {
  it('sets `sparse` density for child components', () => {
    const { container } = render(
      <Density density='sparse'>
        <MockUseDensityConsumerComponent />
      </Density>,
    );

    expect(container).toHaveTextContent('sparse');
  });

  it('sets `compact` density for child components', () => {
    const { container } = render(
      <Density density='compact'>
        <MockUseDensityConsumerComponent />
      </Density>,
    );

    expect(container).toHaveTextContent('compact');
  });

  it('sets `slim` density for child components', () => {
    const { container } = render(
      <Density density='slim'>
        <MockUseDensityConsumerComponent />
      </Density>,
    );

    expect(container).toHaveTextContent('slim');
  });
});
