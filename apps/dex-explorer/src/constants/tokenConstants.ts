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
};

// Recreate from tokenConfigMapOnInner to not have to redefine the same data
export const tokenConfigMapOnSymbol: { [key: string]: Token } = 
    Object.fromEntries(
        Object.entries(tokenConfigMapOnInner).map(([key, value]) => [
        value.symbol.toLowerCase(), // Lowercase to help index if we have discrepancies
        value,
        ])
    );
