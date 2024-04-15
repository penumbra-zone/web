export default (await fetch(new URL('../keys/output_pk.bin', import.meta.url))).arrayBuffer();
