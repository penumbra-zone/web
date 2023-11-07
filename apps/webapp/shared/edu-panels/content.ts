export enum EduPanel {
  ASSETS,
  TRANSACTIONS_LIST,
  SHIELDED_TRANSACTION,
  SENDING_FUNDS,
  RECEIVING_FUNDS,
  TEMP_FILLER,
}

export const eduPanelContent: Record<EduPanel, string> = {
  [EduPanel.ASSETS]:
    'Your balances are shielded, and are known only to you. They are not visible on chain. Each Penumbra wallet controls many numbered accounts, each with its own balance. Account information is never revealed on-chain.',
  [EduPanel.TRANSACTIONS_LIST]:
    'Your wallet scans shielded chain data locally and indexes all relevant transactions it detects, both incoming and outgoing.',
  [EduPanel.SHIELDED_TRANSACTION]:
    'Penumbra transactions are shielded and don’t reveal any information about the sender, receiver, or amount.  Use the toggle to see what information is revealed on-chain.',
  [EduPanel.SENDING_FUNDS]:
    'Penumbra transactions include a shielded memo only visible to the sender and receiver.  The sender’s address is included in the memo by default so the receiver can identify the payment.',
  [EduPanel.RECEIVING_FUNDS]:
    'Every Penumbra account has a stable default address and many one-time addresses.  All addresses for the same account deposit to the same pool of funds.  Use a freshly generated one-time address in situations where you need to reveal an address publicly, like an IBC transfer from a transparent chain into Penumbra.',
  [EduPanel.TEMP_FILLER]:
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
};
