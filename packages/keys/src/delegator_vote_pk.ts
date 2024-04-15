export default (
  await fetch(new URL('../keys/delegator_vote_pk.bin', import.meta.url))
).arrayBuffer();
