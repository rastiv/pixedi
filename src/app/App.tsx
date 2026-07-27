import { RouterProvider } from "@/app/providers";
import { AppRouter } from "@/app/router/AppRouter";
import "@/app/styles/index.css";

export default function App() {
  return (
    <RouterProvider>
      <AppRouter />
    </RouterProvider>
  );
}
