declare module "*.svg" {
  import type { FunctionComponent, ComponentProps } from "react";

  const ReactComponent: FunctionComponent<
    ComponentProps<"svg"> & { title?: string }
  > & { $$typeof: symbol };

  export default ReactComponent;
}
