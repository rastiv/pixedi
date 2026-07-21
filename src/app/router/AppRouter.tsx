import { Route, Routes } from "react-router";
import { ROUTES } from "@/shared/config";
import { GalleryPage, ImageEditPage } from "@/features/gallery";

export const AppRouter = () => {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<GalleryPage />} />
      <Route path={ROUTES.IMAGE_EDIT} element={<ImageEditPage />} />
    </Routes>
  );
};
