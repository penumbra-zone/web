import { SelectAccount } from '@penumbra-zone/ui/components/ui/select-account';
import { IndexHeader } from './index-header';
import { useStore } from '../../../state';
import { BlockSync } from './block-sync';
import { localExtStorage } from '@penumbra-zone/storage/chrome/local';
import { getActiveWallet } from '../../../state/wallets';
import { needsLogin } from '../popup-needs';
import { Button } from '@penumbra-zone/ui/components/ui/button';
import { ExternalLink } from 'lucide-react';
import {
  Address,
  FullViewingKey,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { getAddressByIndex, getEphemeralByIndex } from '@penumbra-zone/wasm/keys';
import { Wallet } from '@penumbra-zone/types/wallet';
import { ValidateAddress } from './validate-address';

export interface PopupLoaderData {
  fullSyncHeight?: number;
}

// Because Zustand initializes default empty (prior to persisted storage synced),
// We need to manually check storage for accounts & password in the loader.
// Will redirect to onboarding or password check if necessary.
export const popupIndexLoader = async (): Promise<Response | PopupLoaderData> => {
  const redirect = await needsLogin();
  if (redirect) return redirect;

  return {
    fullSyncHeight: await localExtStorage.get('fullSyncHeight'),
  };
};

const getAddrByIndex =
  (wallet?: Wallet) =>
  (index: number, ephemeral: boolean): Address => {
    if (!wallet) throw new Error('No active wallet');

    const fullViewingKey = FullViewingKey.fromJsonString(wallet.fullViewingKey);
    return ephemeral
      ? getEphemeralByIndex(fullViewingKey, index)
      : getAddressByIndex(fullViewingKey, index);
  };

export const PopupIndex = () => {
  const activeWallet = useStore(getActiveWallet);
  const frontendUrl = 'useStore(state => state.connectedSites.frontendUrl)';

  return (
    <>
      <BlockSync />

      <div className='flex h-full grow flex-col items-stretch gap-[30px] bg-logo bg-left-bottom px-[30px] pb-[30px]'>
        <IndexHeader />

        <div className='flex flex-col gap-8'>
          {activeWallet && <SelectAccount getAddrByIndex={getAddrByIndex(activeWallet)} />}
        </div>

        <ValidateAddress />

        <div className='grow' />

        {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
        {!!frontendUrl && (
          <a href={frontendUrl} target='_blank' rel='noreferrer'>
            <Button className='flex w-full items-center gap-2' variant='gradient'>
              Manage portfolio <ExternalLink size={16} />
            </Button>
          </a>
        )}
      </div>
    </>
  );
};
