export default (await fetch(new URL('../keys/swap_pk.bin', import.meta.url))).arrayBuffer();
