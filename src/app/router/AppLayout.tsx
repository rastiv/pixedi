import { Outlet } from "react-router";
import { Header } from "@/shared/components/Header";
import "../styles/index.css";

export const AppLayout = () => {
  return (
    <main>
      <Header />
      <Outlet />
    </main>
  );
};
