import { Button } from '@penumbra-zone/ui';
import { ReactNode } from 'react';

const CHROME_EXTENSION_ID = 'lkpmkhpnhknhmibgnmmhdhgdilepfghe';

export enum EduPanel {
  ASSETS,
  TRANSACTIONS_LIST,
  SHIELDED_TRANSACTION,
  SENDING_FUNDS,
  RECEIVING_FUNDS,
  IBC_WITHDRAW,
  TEMP_FILLER,
  EXTENSION_NOT_INSTALLED,
}

export const eduPanelContent: Record<EduPanel, ReactNode> = {
  [EduPanel.ASSETS]:
    'Your balances are shielded, and are known only to you. They are not visible on chain. Each Penumbra wallet controls many numbered accounts, each with its own balance. Account information is never revealed on-chain.',
  [EduPanel.TRANSACTIONS_LIST]:
    'Your wallet scans shielded chain data locally and indexes all relevant transactions it detects, both incoming and outgoing.',
  [EduPanel.SHIELDED_TRANSACTION]:
    'Penumbra transactions are shielded and don’t reveal any information about the sender, receiver, or amount.  Use the toggle to see what information is revealed on-chain.',
  [EduPanel.SENDING_FUNDS]:
    'Penumbra transactions include a shielded memo only visible to the sender and receiver.  The sender’s address is included in the memo so the receiver can identify the payment.',
  [EduPanel.RECEIVING_FUNDS]:
    'Every Penumbra account has a stable default address and many one-time IBC deposit addresses.  All addresses for the same account deposit to the same pool of funds.  Use a freshly generated IBC deposit address to preserve privacy when sending funds from a transparent chain to Penumbra.',
  [EduPanel.IBC_WITHDRAW]:
    'IBC to a connected chain. Note that if the chain is a transparent chain, the transaction will be visible to others.',
  [EduPanel.TEMP_FILLER]:
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
  [EduPanel.EXTENSION_NOT_INSTALLED]: (
    <div className='flex items-center gap-4'>
      You need to install the Penumbra Chrome extension to use this app.
      <Button asChild className='px-4 text-white'>
        <a
          href={`https://chrome.google.com/webstore/detail/penumbra-wallet/${CHROME_EXTENSION_ID}`}
          target='_blank'
          rel='noreferrer'
        >
          Install
        </a>
      </Button>
    </div>
  ),
};
