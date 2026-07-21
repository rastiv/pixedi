import { useContext } from "react";
import { StoreContext } from "./StoreContext";

export const useImageEditorContext = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error(
      "useImageEditorContext must be used within an ImageEditorProvider"
    );
  }
  return context;
};
