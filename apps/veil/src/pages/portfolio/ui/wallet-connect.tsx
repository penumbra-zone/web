import React, { useMemo, useEffect, useState } from 'react';
import { Text } from '@penumbra-zone/ui/Text';
import { Eye, ShieldCheckIcon } from 'lucide-react';
import { ConnectButton } from '@/features/connect/connect-button';
import { observer } from 'mobx-react-lite';
import { CosmosConnectButton } from '@/features/cosmos/cosmos-connect-button.tsx';
import { useUnifiedAssets } from '../api/use-unified-assets.ts';
import { GenericShieldButton } from './shield-unshield.tsx';

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
    <div className='grid grid-cols-1 md:grid-cols-2 gap-6 '>
      {/* Shielded Assets Card */}
      <div
        className={`relative bg-accentRadialBackground backdrop-blur-lg rounded-2xl p-6 flex space-between ${
          isConnected ? 'h-[160px]' : 'h-[420px]'
        }`}
      >
        <div className='absolute top-6 right-6'>
          <ShieldCheckIcon className='text-white opacity-10 w-8 h-8' />
        </div>
        <div
          className={`flex flex-col items-start ${!isConnected ? 'gap-6' : 'gap-2'} h-full justify-between`}
        >
          <Text color='text.secondary'>Shielded Assets</Text>

          {isPenumbraConnected ? (
            // Show total asset value when connected
            <div className='space-y-2'>
              <div className='text-3xl font-mono text-primary-light'>
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
        className={`relative bg-unshieldRadialBackground backdrop-blur-lg rounded-2xl p-6 flex space-between ${
          isConnected ? 'h-[160px]' : 'h-[420px]'
        }`}
      >
        <div className='absolute top-6 right-6'>
          <Eye className='text-white opacity-10 w-8 h-8' />
        </div>
        <div className='flex flex-col gap-2 h-full justify-between w-full'>
          <Text color='text.secondary'>Public Assets</Text>

          {isCosmosConnected ? (
            // Show total public asset value when connected
            <div className='flex justify-between w-full items-center'>
              <div className='text-3xl font-mono text-unshield-light'>
                {formattedPublicValue} USDC
              </div>
              <div className='w-fit flex gap-2 items-center'>
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
