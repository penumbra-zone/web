import { useState } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { Tabs } from '@penumbra-zone/ui/Tabs';
import { Density } from '@penumbra-zone/ui/Density';
import { Toggle } from '@penumbra-zone/ui/Toggle';
import { Text } from '@penumbra-zone/ui/Text';
import { PositionsTable } from '@/entities/position';
import { LiquidityTable } from '@/entities/liquidity';
import { usePathToMetadata } from '../model/use-path';
import { PositionState_PositionStateEnum as State } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';

enum PositionsTabsType {
  MY_POSITIONS = 'MY_POSITIONS',
  MANAGE_LIQUIDITY = 'MANAGE_LIQUIDITY',
}

export const HistoryTabs = () => {
  const [parent] = useAutoAnimate();
  const [tab, setTab] = useState<PositionsTabsType>(PositionsTabsType.MY_POSITIONS);
  const [showInactive, setshowInactive] = useState(false);
  const { baseAsset, quoteAsset } = usePathToMetadata();

  return (
    <div ref={parent} className='flex w-screen flex-col desktop:w-auto'>
      <div className='flex justify-between gap-2 border-b border-b-other-solid-stroke px-4'>
        <Density compact>
          <Tabs
            value={tab}
            actionType='accent'
            onChange={value => setTab(value as PositionsTabsType)}
            options={[
              { value: PositionsTabsType.MY_POSITIONS, label: 'My Positions' },
              { value: PositionsTabsType.MANAGE_LIQUIDITY, label: 'Manage Liquidity' },
            ]}
          />
        </Density>

        <label className='flex h-[42px] cursor-pointer items-center gap-2 py-2 text-text-secondary'>
          <Text small>Show Inactive</Text>
          <Toggle label='Show Inactive' value={showInactive} onChange={setshowInactive} />
        </label>
      </div>

      <div className='p-4'>
        {tab === PositionsTabsType.MY_POSITIONS && (
          <PositionsTable
            base={baseAsset}
            quote={quoteAsset}
            stateFilter={
              showInactive
                ? [State.OPENED, State.CLOSED, State.WITHDRAWN]
                : [State.OPENED, State.CLOSED]
            }
          />
        )}
        {tab === PositionsTabsType.MANAGE_LIQUIDITY && <LiquidityTable />}
      </div>
    </div>
  );
};
