declare module '*.mp4' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*_pk.bin' {
  const key: string;
  export default key;
}
