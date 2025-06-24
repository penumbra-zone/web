import React, { useMemo } from 'react';
import { Text } from '@penumbra-zone/ui/Text';
import { Eye, ShieldCheckIcon, Info } from 'lucide-react';
import { ConnectButton } from '@/features/connect/connect-button';
import { observer } from 'mobx-react-lite';
import { CosmosConnectButton } from '@/features/cosmos/cosmos-connect-button.tsx';
import { useUnifiedAssets } from '../api/use-unified-assets.ts';
import { GenericShieldButton } from './shield-unshield.tsx';
import { Tooltip } from '@penumbra-zone/ui/Tooltip';

export const WalletConnect = observer(() => {
  const { isPenumbraConnected, isCosmosConnected, totalPublicValue, totalShieldedValue } =
    useUnifiedAssets();

  const isConnected = isPenumbraConnected || isCosmosConnected;
  // Format the values with commas and 2 decimal places
  const formattedShieldedValue = useMemo(() => {
    return totalShieldedValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [totalShieldedValue]);

  const formattedPublicValue = useMemo(() => {
    return totalPublicValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [totalPublicValue]);

  return (
    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
      {/* Shielded Assets Card */}
      <div
        className={`relative flex justify-between rounded-2xl bg-accent-radial-background p-6 backdrop-blur-lg ${
          isConnected ? 'h-[160px]' : 'h-[420px]'
        }`}
      >
        <div className='absolute top-6 right-6'>
          <ShieldCheckIcon className='h-8 w-8 text-white opacity-10' />
        </div>
        <div
          className={`flex flex-col items-start ${!isConnected ? 'gap-6' : 'gap-2'} h-full justify-between`}
        >
          <div className='flex items-center gap-1'>
            <Text color='text.secondary'>Shielded Assets</Text>
            {isConnected && (
              <Tooltip message='Shield your public assets into Penumbra to start trading'>
                <Info className='h-4 w-4 text-neutral-400' />
              </Tooltip>
            )}
          </div>

          {isPenumbraConnected ? (
            // Show total asset value when connected
            <div className='space-y-2'>
              <div className='font-mono text-3xl text-primary-light'>
                {formattedShieldedValue} USDC
              </div>
            </div>
          ) : (
            <>
              {!isConnected && (
                <div className='space-y-2 text-3xl'>
                  <Text h4 color='text.primary'>
                    Connect your <span className='text-primary-light'>Prax Wallet</span> to access
                    shielded assets and liquidity positions
                  </Text>
                </div>
              )}
              <div className={'w-fit'}>
                <ConnectButton
                  variant={isCosmosConnected ? 'minimal' : 'default'}
                  actionType='accent'
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Public Assets Card */}
      <div
        className={`relative flex justify-between rounded-2xl bg-unshield-radial-background p-6 backdrop-blur-lg ${
          isConnected ? 'h-[160px]' : 'h-[420px]'
        }`}
      >
        <div className='absolute top-6 right-6'>
          <Eye className='h-8 w-8 text-white opacity-10' />
        </div>
        <div className='flex h-full w-full flex-col justify-between gap-2'>
          <div className='flex items-center gap-1'>
            <Text color='text.secondary'>Public Assets</Text>
            {isConnected && (
              <Tooltip message='Fund your Cosmos Wallet in order to shield assets into Penumbra'>
                <Info className='h-4 w-4 text-neutral-400' />
              </Tooltip>
            )}
          </div>

          {isCosmosConnected ? (
            // Show total public asset value when connected
            <div className='flex w-full items-center justify-between'>
              <div className='font-mono text-3xl text-unshield-light'>
                {formattedPublicValue} USDC
              </div>
              <div className='flex w-fit items-center gap-2'>
                <GenericShieldButton />
                <CosmosConnectButton iconOnly variant={'minimal'} actionType='unshield' />
              </div>
            </div>
          ) : (
            <>
              {!isConnected && (
                <div className='space-y-2 text-3xl'>
                  <Text h4 color='text.primary'>
                    Connect your <span className='text-unshield-light'>Cosmos Wallet</span> to
                    manage public assets and shield them in Penumbra
                  </Text>
                </div>
              )}

              <div className={'w-fit'}>
                <CosmosConnectButton
                  variant={isPenumbraConnected ? 'minimal' : 'default'}
                  actionType='unshield'
                  noIcon
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
});
