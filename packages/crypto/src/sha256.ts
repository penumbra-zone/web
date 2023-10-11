// Function to convert a byte to a hexadecimal string
const byteToHex = (byte: number): string => byte.toString(16).padStart(2, '0');

export const sha256HashStr = async (inputBuffer: Uint8Array): Promise<string> => {
  const uint8Arr = await sha256Hash(inputBuffer);
  return Array.from(uint8Arr).map(byteToHex).join('');
};

export const sha256Hash = async (inputBuffer: Uint8Array): Promise<Uint8Array> => {
  const digestBuffer = await crypto.subtle.digest('SHA-256', inputBuffer);
  return new Uint8Array(digestBuffer);
};
