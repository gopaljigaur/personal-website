import "react";

declare module "react" {
  export const unstable_ViewTransition: React.FC<{ children: React.ReactNode }>;
}
