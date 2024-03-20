import { bech32 } from 'bech32';

/**
 * Validates a Bech32 encoded address. If a prefix is provided, it also checks that the address's
 * prefix matches the expected prefix.
 */
export const bech32IsValid = (bech32Address: string, prefix?: string): boolean => {
  try {
    const { prefix: decodedPrefix } = bech32.decode(bech32Address);
    return prefix ? prefix === decodedPrefix : true;
  } catch (error) {
    // If there's an error in decoding, it means the address is not valid Bech32
    return false;
  }
};
