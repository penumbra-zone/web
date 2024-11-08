import type { Meta, StoryObj } from '@storybook/react';

import { openToast, ToastProvider, ToastType } from '.';
import { Button } from '../Button';
import { Tooltip } from '../Tooltip';
import { Text } from '../Text';
import { styled } from 'styled-components';

const meta: Meta<typeof ToastProvider> = {
  component: ToastProvider,
  tags: ['autodocs', '!dev'],
  argTypes: {},
};
export default meta;

type Story = StoryObj<typeof ToastProvider>;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${props => props.theme.spacing(2)};
`;

export const Basic: Story = {
  render: function Render() {
    const toast = (type: ToastType) => {
      openToast({
        type,
        message: 'Hello, world!',
        description: 'Additional text can possibly be long enough lorem ipsum dolor sit amet.',
      });
    };

    const upload = () => {
      const t = openToast({
        type: 'loading',
        message: 'Hello, world!',
      });

      setTimeout(() => {
        t.update({
          type: 'error',
          message: 'Failed!',
          description: 'Unknown error',
        });
      }, 2000);
    };

    const action = () => {
      openToast({
        type: 'warning',
        message: 'Do you confirm?',
        dismissible: false,
        persistent: true,
        action: {
          label: 'Yes!',
          onClick: () => {
            openToast({
              type: 'success',
              message: 'Confirmed!',
              dismissible: false,
            });
          },
        },
      });
    };

    return (
      <>
        <ToastProvider />

        <Text h4>All style types of toasts</Text>

        <Row>
          <Button onClick={() => toast('info')}>Info</Button>
          <Button onClick={() => toast('success')}>Success</Button>
          <Button onClick={() => toast('warning')}>Warning</Button>
          <Button onClick={() => toast('error')}>Error</Button>
          <Tooltip message='Cannot be closed by user until status is updated'>
            <Button onClick={() => toast('loading')}>Loading</Button>
          </Tooltip>
        </Row>

        <Text h4>Updating toast</Text>

        <Row>
          <Tooltip message='Starts as a loading toast, after 2 seconds updated to the error type'>
            <Button onClick={upload}>Open</Button>
          </Tooltip>
        </Row>

        <Text h4>Action toast</Text>

        <Row>
          <Button onClick={action}>Open</Button>
        </Row>
      </>
    );
  },
};
