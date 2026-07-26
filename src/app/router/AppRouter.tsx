import { Route, Routes } from "react-router";
import { ROUTES } from "@/shared/config";
import { ImageEditPage } from "@/features/gallery";
import { HomePage } from "@/features/home";
import { AppLayout } from "./AppLayout";
import { PackagePage, PackageDemo } from "@/features/package";
import { WidgetPage, WidgetDemo } from "@/features/widget";

export const AppRouter = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.IMAGE_EDIT} element={<ImageEditPage />} />
        <Route path={ROUTES.PACKAGE} element={<PackagePage />} />
        <Route path={ROUTES.PACKAGE_DEMO} element={<PackageDemo />} />
        <Route path={ROUTES.WIDGET} element={<WidgetPage />} />
        <Route path={ROUTES.WIDGET_DEMO} element={<WidgetDemo />} />
      </Route>
    </Routes>
  );
};
