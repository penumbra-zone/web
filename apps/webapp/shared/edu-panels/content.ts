export enum EduPanel {
  ASSETS,
  TRANSACTIONS,
  TEMP_FILLER,
}

export const eduPanelContent: Record<EduPanel, string> = {
  [EduPanel.ASSETS]:
    'Your balances are shielded, and are known only to you. They are not visible on chain.',
  [EduPanel.TRANSACTIONS]:
    'This is a list of all transactions visible to your wallet, both incoming and outgoing.',
  [EduPanel.TEMP_FILLER]:
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
};
