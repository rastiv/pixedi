import { Preview } from "../preview";
import { UrlFilters } from "./UrlFilters";

export const FilterInteractBox = () => {
  return (
    <>
      <UrlFilters />
      <Preview
        isClipped
        isFiltered
        style={{ clipPath: `xywh(0% 0% 100% 100%)` }}
      />
    </>
  );
};
