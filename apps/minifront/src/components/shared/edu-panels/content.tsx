export enum EduPanel {
  ASSETS,
  TRANSACTIONS_LIST,
  SHIELDED_TRANSACTION,
  SENDING_FUNDS,
  RECEIVING_FUNDS,
  IBC_WITHDRAW,
  SWAP,
  SWAP_AUCTION,
  STAKING,
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
    'Penumbra transactions include a shielded memo only visible to the sender and receiver.  The sender’s address is included in the memo so the receiver can identify the payment.',
  [EduPanel.RECEIVING_FUNDS]:
    'Every Penumbra account has a stable default address and many one-time IBC deposit addresses.  All addresses for the same account deposit to the same pool of funds.  Use a freshly generated IBC deposit address to preserve privacy when sending funds from a transparent chain to Penumbra.',
  [EduPanel.IBC_WITHDRAW]:
    'IBC to a connected chain. Note that if the chain is a transparent chain, the transaction will be visible to others.',
  [EduPanel.SWAP]:
    'Shielded swaps between any kind of cryptoasset, with sealed-bid, batch pricing and no frontrunning. Only the batch totals are revealed, providing long-term privacy. Penumbra has no MEV, because transactions do not leak data about user activity.',
  [EduPanel.SWAP_AUCTION]:
    "Offer a specific quantity of cryptocurrency at decreasing prices until all the tokens are sold. Buyers can place bids at the price they're willing to pay, with the auction concluding when all tokens are sold or when the auction time expires. This mechanism allows for price discovery based on market demand, with participants potentially acquiring tokens at prices lower than initially offered.",
  [EduPanel.STAKING]:
    'Explore the available validator nodes and their associated rewards, performance metrics, and staking requirements. Select the validator you wish to delegate your tokens to, based on factors like uptime, reputation, and expected returns. Stay informed about validator performance updates, rewards distribution, and any network upgrades to ensure a seamless staking experience.',
  [EduPanel.TEMP_FILLER]:
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
};
