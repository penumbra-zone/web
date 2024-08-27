declare module "*.svg" {
  import type { FunctionComponent, ComponentProps } from "react";

  const ReactComponent: FunctionComponent<
    ComponentProps<"svg"> & { title?: string, className?: string }
  >;

  export default ReactComponent;
}
