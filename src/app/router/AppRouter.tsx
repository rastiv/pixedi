import { Route, Routes } from "react-router";
import { ROUTES } from "@/shared/config";
import { HomePage } from "@/features/home";
import { AppLayout } from "./AppLayout";

export const AppRouter = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path={ROUTES.HOME} element={<HomePage />} />
      </Route>
    </Routes>
  );
};
