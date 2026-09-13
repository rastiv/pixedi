import { Preview } from "../preview";

export const FilterInteractBox = () => {
  return (
    <Preview
      isClipped
      isFiltered
      style={{ clipPath: `xywh(0% 0% 100% 100%)` }}
    />
  );
};
