import { useContext } from "react";
import { StoreContext } from "./StoreContext";

export const usePixediContext = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("usePixediContext must be used within an PixediProvider");
  }
  return context;
};
