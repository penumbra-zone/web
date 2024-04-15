export default (await fetch(new URL('../keys/spend_pk.bin', import.meta.url))).arrayBuffer();
