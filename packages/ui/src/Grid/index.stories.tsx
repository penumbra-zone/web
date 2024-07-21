import type { Meta, StoryObj } from '@storybook/react';
import { Grid } from '.';
import styled from 'styled-components';
import { Text } from '../Text';

const meta: Meta<typeof Grid> = {
  component: Grid,
  title: 'Grid',
  tags: ['autodocs', '!dev'],
  argTypes: {
    container: { control: false },
    mobile: { control: false },
    tablet: { control: false },
    desktop: { control: false },
    lg: { control: false },
    xl: { control: false },
    as: { control: false },
  },
};
export default meta;

type Story = StoryObj<typeof Grid>;

const Item = styled.div`
  background-color: ${props => props.theme.color.neutral.main};
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
            <Text technical>mobile=12</Text>
          </Item>
        </Grid>

        {Array(2)
          .fill(null)
          .map((_, index) => (
            <Grid mobile={12} tablet={6} key={index}>
              <Item>
                <Text technical>mobile=12 tablet=6</Text>
              </Item>
            </Grid>
          ))}

        {Array(4)
          .fill(null)
          .map((_, index) => (
            <Grid mobile={6} tablet={6} desktop={3} key={index}>
              <Item>
                <Text technical>mobile=6 tablet=6 desktop=3</Text>
              </Item>
            </Grid>
          ))}

        {Array(48)
          .fill(null)
          .map((_, index) => (
            <Grid key={index} lg={1}>
              <Item>
                <Text technical>lg=1</Text>
              </Item>
            </Grid>
          ))}
      </Grid>
    );
  },
};
