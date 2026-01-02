/// <reference types="vite/client" />

declare module "*.md" {
  import { ComponentType } from "react";
  const Component: ComponentType;
  export default Component;
}

declare module "*.mdx" {
  import { ComponentType } from "react";
  const Component: ComponentType;
  export default Component;
}
