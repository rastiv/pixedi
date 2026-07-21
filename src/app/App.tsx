import { RouterProvider } from "@/app/providers";
import { AppRouter } from "@/app/router/AppRouter";

export default function App() {
  return (
    <RouterProvider>
      <AppRouter />
    </RouterProvider>
  );
}
