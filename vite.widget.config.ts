import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

export default defineConfig({
  plugins: [
    react(),
    cssInjectedByJsPlugin({
      attributes: { "data-image-editor-widget": "" },
    }),
  ],
  publicDir: false,
  define: {
    "process.env.NODE_ENV": '"production"',
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist/widget",
    emptyOutDir: false,
    minify: "oxc",
    lib: {
      entry: "src/widget.tsx",
      name: "ImageEditorWidget",
      formats: ["umd"],
    },
    rolldownOptions: {
      output: {
        comments: { legal: false },
        entryFileNames: "pixedi-widget.js",
        assetFileNames: "[name].[ext]",
      },
    },
  },
});
