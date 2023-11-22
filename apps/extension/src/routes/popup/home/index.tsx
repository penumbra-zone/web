import { redirect } from 'react-router-dom';
import { SelectAccount } from '@penumbra-zone/ui';
import { PopupPath } from '../paths';
import { IndexHeader } from './index-header';
import { useStore } from '../../../state';
import { BlockSync } from './block-sync';
import { localExtStorage, sessionExtStorage } from '@penumbra-zone/storage';
import {
  getAddressByIndex,
  getEphemeralByIndex,
  getShortAddressByIndex,
} from '@penumbra-zone/wasm-ts';
import { bech32Address } from '@penumbra-zone/types';
import { getActiveWallet } from '../../../state/wallets';

export interface PopupLoaderData {
  lastBlockSynced: number;
}

// Because Zustand initializes default empty (prior to persisted storage synced),
// We need to manually check storage for accounts & password in the loader.
// Will redirect to onboarding or password check if necessary.
export const popupIndexLoader = async (): Promise<Response | PopupLoaderData> => {
  const wallets = await localExtStorage.get('wallets');

  if (!wallets.length) {
    await chrome.tabs.create({ url: chrome.runtime.getURL(`page.html`) });
    window.close();
  }

  const password = await sessionExtStorage.get('passwordKey');

  if (!password) return redirect(PopupPath.LOGIN);

  const lastBlockSynced = await localExtStorage.get('lastBlockSynced');

  return { lastBlockSynced };
};

export const PopupIndex = () => {
  const state = useStore();

  const getAccount = (index: number, ephemeral: boolean) => {
    const active = getActiveWallet(state);
    if (!active) return;

    const addr = ephemeral
      ? getEphemeralByIndex(active.fullViewingKey, index)
      : getAddressByIndex(active.fullViewingKey, index);
    const bech32Addr = bech32Address(addr);

    return {
      address: bech32Addr,
      preview: ephemeral
        ? bech32Addr.slice(0, 33) + '…'
        : getShortAddressByIndex(active.fullViewingKey, index),
      index,
    };
  };

  return (
    <div className='relative flex h-full flex-col items-stretch justify-start bg-left-bottom px-[30px]'>
      <div className='absolute bottom-[50px] left-[-10px] -z-10 h-[715px] w-[900px] overflow-hidden bg-logo opacity-10' />
      <IndexHeader />
      <div className='my-32'>
        <SelectAccount getAccount={getAccount} />
      </div>
      <BlockSync />
    </div>
  );
};
