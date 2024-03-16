export interface Token {
  decimals: number;
  symbol: string;
  inner: string;
  imagePath?: string;
}

export const tokenConfigMapOnInner: { [key: string]: Token } = {
  "KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=": {
    decimals: 6,
    symbol: "penumbra",
    inner: "KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=",
    imagePath: "/assets/icons/penumbra.png",
  },
  "6KBVsPINa8gWSHhfH+kAFJC4afEJA3EtuB2HyCqJUws=": {
    decimals: 0,
    symbol: "cube",
    inner: "6KBVsPINa8gWSHhfH+kAFJC4afEJA3EtuB2HyCqJUws=",
  },
  "reum7wQmk/owgvGMWMZn/6RFPV24zIKq3W6In/WwZgg=": {
    decimals: 18,
    symbol: "test_usd",
    inner: "reum7wQmk/owgvGMWMZn/6RFPV24zIKq3W6In/WwZgg=",
  },
  "HW2Eq3UZVSBttoUwUi/MUtE7rr2UU7/UH500byp7OAc=": {
    decimals: 6,
    symbol: "gm",
    inner: "HW2Eq3UZVSBttoUwUi/MUtE7rr2UU7/UH500byp7OAc=",
  },
  "nwPDkQq3OvLnBwGTD+nmv1Ifb2GEmFCgNHrU++9BsRE=": {
    decimals: 6,
    symbol: "gn",
    inner: "nwPDkQq3OvLnBwGTD+nmv1Ifb2GEmFCgNHrU++9BsRE=",
  },
};

// Recreate from tokenConfigMapOnInner to not have to redefine the same data
export const tokenConfigMapOnSymbol: { [key: string]: Token } = 
    Object.fromEntries(
        Object.entries(tokenConfigMapOnInner).map(([key, value]) => [
        value.symbol.toLowerCase(), // Lowercase to help index if we have discrepancies
        value,
        ])
    );
