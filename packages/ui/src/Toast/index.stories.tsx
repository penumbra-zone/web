import type { Meta, StoryObj } from '@storybook/react';

import { CheckCircle, AlertCircle } from 'lucide-react';
import { ToastProvider, useToast } from '.';
import { Button } from '../Button';

const meta: Meta<typeof ToastProvider> = {
  component: ToastProvider,
  tags: ['autodocs', '!dev'],
  argTypes: {},
};
export default meta;

type Story = StoryObj<typeof ToastProvider>;

const ToastRenderer = () => {
  const openToast = useToast();

  const onOpenClassic = () => {
    openToast({
      title: 'Hello world',
      description: 'This is a toast message',
      icon: CheckCircle,
    });
  };

  const onOpenRerendering = () => {
    const toast = openToast({
      title: 'Re-rendering toast',
      actionType: 'destructive',
      description: 'This is a toast message. It will re-render in 2 second',
      icon: AlertCircle,
    });

    setTimeout(() => {
      toast.update({
        title: 'Re-rendering toast',
        icon: CheckCircle,
        actionType: 'accent',
        description: 'Wow, not it is updated!',
      });
    }, 2000);
  };

  return (
    <div>
      <Button onClick={onOpenClassic}>Open classic toast</Button>
      <Button onClick={onOpenRerendering}>Open re-rendering toast</Button>
    </div>
  );
};

export const Basic: Story = {
  args: {},

  render: function Render() {
    return (
      <ToastProvider>
        <ToastRenderer />
      </ToastProvider>
    );
  },
};
