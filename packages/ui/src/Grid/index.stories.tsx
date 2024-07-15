import type { Meta, StoryObj } from '@storybook/react';
import { Grid } from '.';
import styled from 'styled-components';
import { Technical } from '../Typography';

const meta: Meta<typeof Grid> = {
  component: Grid,
  title: 'Grid',
  tags: ['autodocs', '!dev'],
};
export default meta;

type Story = StoryObj<typeof Grid>;

const Item = styled.div`
  background-color: ${props => props.theme.colors.neutral.main};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing(2)};
`;

export const Demo: Story = {
  render: function Render() {
    return (
      <Grid container as='main'>
        <Grid mobile={12} as='section'>
          <Item>
            <Technical>mobile=12</Technical>
          </Item>
        </Grid>

        {Array(2)
          .fill(null)
          .map((_, index) => (
            <Grid mobile={12} tablet={6} key={index}>
              <Item>
                <Technical>mobile=12 tablet=6</Technical>
              </Item>
            </Grid>
          ))}

        {Array(4)
          .fill(null)
          .map((_, index) => (
            <Grid mobile={6} tablet={6} desktop={3} key={index}>
              <Item>
                <Technical>mobile=6 tablet=6 desktop=3</Technical>
              </Item>
            </Grid>
          ))}

        {Array(48)
          .fill(null)
          .map((_, index) => (
            <Grid key={index} lg={1}>
              <Item>
                <Technical>lg=1</Technical>
              </Item>
            </Grid>
          ))}
      </Grid>
    );
  },
};
