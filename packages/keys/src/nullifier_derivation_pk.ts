export default (
  await fetch(new URL('../keys/nullifier_derivation_pk.bin', import.meta.url))
).arrayBuffer();
