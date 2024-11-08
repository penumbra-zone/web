import type { Meta, StoryObj } from '@storybook/react';
import { Grid } from '.';
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

export const Demo: Story = {
  render: function Render() {
    return (
      <Grid container as='main'>
        <Grid mobile={12} as='section'>
          <div className='flex items-center justify-center bg-neutral-main p-2'>
            <Text technical>mobile=12</Text>
          </div>
        </Grid>

        {Array(2)
          .fill(null)
          .map((_, index) => (
            <Grid mobile={12} tablet={6} key={index}>
              <div className='flex items-center justify-center bg-neutral-main p-2'>
                <Text technical>mobile=12 tablet=6</Text>
              </div>
            </Grid>
          ))}

        {Array(4)
          .fill(null)
          .map((_, index) => (
            <Grid mobile={6} tablet={6} desktop={3} key={index}>
              <div className='flex items-center justify-center bg-neutral-main p-2'>
                <Text technical>mobile=6 tablet=6 desktop=3</Text>
              </div>
            </Grid>
          ))}

        {Array(48)
          .fill(null)
          .map((_, index) => (
            <Grid key={index} lg={1}>
              <div className='flex items-center justify-center bg-neutral-main p-2'>
                <Text technical>lg=1</Text>
              </div>
            </Grid>
          ))}
      </Grid>
    );
  },
};
