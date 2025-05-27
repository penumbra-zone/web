declare module '@microlink/react-json-view' {
  export type ThemeKeys = string;

  interface ReactJsonViewProps {
    src: any;
    collapsed?: boolean | number;
    enableClipboard?: boolean;
    style?: React.CSSProperties;
    theme?: ThemeKeys;
    displayDataTypes?: boolean;
    displayObjectSize?: boolean;
  }

  const ReactJsonView: React.ComponentType<ReactJsonViewProps>;
  export default ReactJsonView;
}
