// import bip39 from 'bip39';
//
// export const generateSeedPhrase = async () => {
//   return bip39.entropyToMnemonic(Buffer.from(bytes).toString('hex'));
// };
//
// // static async generateSeed(rng: RNG, strength: number = 128): Promise<string> {
// //   if (strength % 32 !== 0) {
// //   throw new TypeError("invalid entropy");
// // }
// // let bytes = new Uint8Array(strength / 8);
// // bytes = await rng(bytes);
// // return bip39.entropyToMnemonic(Buffer.from(bytes).toString("hex"));
// }
//
// // const rng = (array: any) => {
// //   return Promise.resolve(crypto.getRandomValues(array));
// // };
// //
// // if (wordsType === "12words") {
// //   Mnemonic.generateSeed(rng, 128).then((str) => setWords(str.split(" ")));
// // } else if (wordsType === "24words") {
// //   Mnemonic.generateSeed(rng, 256).then((str) => setWords(str.split(" ")));
// // } else {
// //   throw new Error(`Unknown words type: ${wordsType}`);
// // }
