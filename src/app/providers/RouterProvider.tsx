import type { ReactNode } from "react";
import { BrowserRouter } from "react-router";

export const RouterProvider = ({ children }: { children: ReactNode }) => {
  return <BrowserRouter>{children}</BrowserRouter>;
};
