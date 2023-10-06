// Function to convert a byte to a hexadecimal string
const byteToHex = (byte: number): string => byte.toString(16).padStart(2, '0');

export const sha256Hash = async (inputBuffer: Uint8Array): Promise<string> => {
  const digestBuffer = await crypto.subtle.digest('SHA-256', inputBuffer);
  return Array.from(new Uint8Array(digestBuffer)).map(byteToHex).join('');
};
