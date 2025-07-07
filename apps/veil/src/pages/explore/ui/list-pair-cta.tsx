'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@penumbra-zone/ui/Button';
import { Text } from '@penumbra-zone/ui/Text';

export const ListPairCTA = () => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className='mt-4' style={{ fontFamily: 'Inter, -apple-system, system-ui, sans-serif' }}>
      <div className='flex items-center justify-between rounded-md bg-other-tonalFill5/50 px-3 py-2'>
        <div className='flex items-center gap-2'>
          <Plus className='h-3 w-3 text-text-secondary' />
          <Text detail color='text.secondary'>
            Don't see your pair? Markets with $1,000+ liquidity near the spread appear automatically.
          </Text>
          {!showDetails && (
            <button
              onClick={() => setShowDetails(true)}
              className='text-xs text-text-secondary underline hover:text-text-primary'
            >
              Learn more
            </button>
          )}
        </div>
        <Button 
          onClick={() => {
            // TODO: Implement provide liquidity functionality
            console.log('Provide liquidity clicked');
          }}
          priority='secondary'
          size='sm'
        >
          Provide liquidity
        </Button>
      </div>
      
      {showDetails && (
        <div className='mt-2 rounded-md border border-other-tonalStroke bg-background/40 p-4'>
          <button
            onClick={() => setShowDetails(false)}
            className='float-right -mt-1 text-sm text-text-secondary hover:text-text-primary'
          >
            ✕
          </button>
          <div className='space-y-3 pr-6' style={{ fontFamily: 'Inter, -apple-system, system-ui, sans-serif' }}>
            <div>
              <p className='text-sm font-medium text-text-primary mb-1'>Permissionless markets, automatic discovery</p>
              <p className='text-xs text-text-secondary leading-relaxed'>
                Anyone can bridge assets and create trading pairs on Penumbra. No gatekeepers, no committees, 
                no listing applications. The protocol is neutral decentralized infrastructure: deposit your assets and start making markets.
              </p>
            </div>
            
            <div>
              <p className='text-sm font-medium text-text-primary mb-1'>Liquidity determines visibility</p>
              <p className='text-xs text-text-secondary leading-relaxed'>
                This interface filters for pairs with genuine trading interest. Markets need $1,000+ deployed within ±2% 
                of the mid-market price to appear. It's pure market dynamics - more liquidity means more visibility. 
                No fees, no favoritism, just depth.
              </p>
            </div>
            
            <div>
              <p className='text-sm font-medium text-text-primary mb-1'>Be the market maker</p>
              <p className='text-xs text-text-secondary leading-relaxed'>
                Bootstrap new markets and earn fees from the bid-ask spread. Concentrated liquidity positions let you 
                deploy capital efficiently. As a liquidity provider, you're the infrastructure enabling private, 
                trustless swaps for traders worldwide.
              </p>
              <p className='text-xs text-text-secondary/80 mt-1.5 italic'>
                Warning: Market making involves risk. Providing liquidity may result in gains or losses depending on market conditions.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};