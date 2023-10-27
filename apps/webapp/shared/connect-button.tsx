'use client';

import { Button, ButtonProps } from '@penumbra-zone/ui';
import { useConnect } from '../hooks/connect';
import { cn } from '@penumbra-zone/ui/lib/utils';

interface ConnnectButtonProps {
  className?: string;
  size?: ButtonProps['size'];
}

const ConnectButton = ({ className, size = 'sm' }: ConnnectButtonProps) => {
  const { connect } = useConnect();

  return (
    <Button
      className={cn('w-[150px]', className)}
      size={size}
      variant='gradient'
      onClick={() => void connect()}
    >
      Connect Wallet
    </Button>
  );
};

export default ConnectButton;
