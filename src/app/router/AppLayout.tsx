import { Outlet } from "react-router";
import { Header } from "@/shared/components/Header";

export const AppLayout = () => {
  return (
    <main>
      <Header />
      <Outlet />
    </main>
  );
};
