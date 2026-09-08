import { usePixediContext } from "@/shared/components/Pixedi/provider/usePixediContext";
import { Preview } from "../preview";
import { ActionName } from "@/shared/components/Pixedi/types";

export const FilterInteractBox = () => {
  const { currentAction } = usePixediContext();
  const url =
    currentAction?.name === ActionName.FILTERS ? currentAction.url : "";

  if (!url) return null;

  return (
    <Preview
      isClipped
      style={{ clipPath: `xywh(0% 0% 100% 100%)`, filter: `url(#${url})` }}
    />
  );
};
