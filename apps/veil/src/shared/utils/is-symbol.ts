const STABLECOIN_SYMBOLS = ['USDC', 'USDY', 'USDT'];

// important numeraire symbols
const NUMERAIRE_SYMBOLS = ['BTC', 'UM'];

/**
 * Check if a symbol is a stablecoin.
 * `symbol` is internally converted to uppercase, so is case-insensitive.
 *
 * @param symbol - The symbol to check.
 * @returns True if the symbol is a stablecoin, false otherwise.
 */
export function isStablecoinSymbol(symbol: string): boolean {
  return STABLECOIN_SYMBOLS.includes(symbol.toUpperCase());
}

/**
 * Check if a symbol is an important numeraire like BTC or UM.
 * `symbol` is internally converted to uppercase, so is case-insensitive.
 *
 * @param symbol - The symbol to check.
 * @returns True if the symbol is an important numeraire, false otherwise.
 */
export function isNumeraireSymbol(symbol: string): boolean {
  return NUMERAIRE_SYMBOLS.includes(symbol.toUpperCase());
}
