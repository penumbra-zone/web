import type { Meta, StoryObj } from '@storybook/react';

import Grid from '@mui/system/Unstable_Grid';
import styled from 'styled-components';
import { Body } from '../Typography';

const meta: Meta<typeof Grid> = {
  component: Grid,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Grid>;

const Wrapper = styled.div({ color: 'white' });

export const Basic: Story = {
  args: {},

  render: function Render() {
    return (
      <Wrapper>
        <Grid container gap={4}>
          {Array(48)
            .fill(null)
            .map((_, index) => (
              <Grid
                key={index}
                mobile={6}
                tablet={4}
                desktop={3}
                lg={2}
                xl={1}
                bgcolor='neutral.700'
              >
                <Body>{index + 1}</Body>
              </Grid>
            ))}
        </Grid>
      </Wrapper>
    );
  },
};
