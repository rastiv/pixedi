import { useState } from "react";
import { PixediProvider } from "./provider/PixediProvider";
import { initialSettings } from "./provider/initialState";
import { translations as initilaTranslations } from "./constants";
import { useBelow, useImageLoader } from "./hooks";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { Infobar } from "./infobar";
import { Frame } from "./frame";
import { Loader } from "./assets/icons";
import { UrlFilters } from "./filters/UrlFilters";
import {
  type FuncSaveArgs,
  type Theme,
  type Settings,
  ActionName,
} from "./types";
import styles from "./index.module.css";

type PixediProps = {
  image: string | Blob;
  onSave: FuncSaveArgs;
  onBack: () => void;
  theme?: Theme;
  settings?: Settings;
  translations?: Record<string, string>;
};

export const Pixedi = ({
  image,
  onSave,
  onBack,
  theme = "light",
  settings = initialSettings,
  translations,
}: PixediProps) => {
  const [wrapper, setWrapper] = useState<HTMLDivElement | null>(null);

  const isBelowSm = useBelow("sm", wrapper);

  const defaultSettings = {
    ...initialSettings,
    ...settings,
  };

  const defaultTranslations = { ...initilaTranslations, ...translations };

  const {
    loading,
    error,
    mimeType,
    width,
    height,
    originalBlob,
    previewUrl,
    isAlpha,
  } = useImageLoader({
    src: image,
    skip: defaultSettings?.tools?.length === 0,
  });

  if (defaultSettings?.tools?.length === 0) {
    return (
      <div className={`${styles.root} ${styles.wrapper}`} data-theme={theme}>
        <div className={styles.system}>
          <div className={styles.textRed}>
            {defaultTranslations?.msgNoTools || "msgNoTools"}
          </div>
        </div>
      </div>
    );
  }

  if (loading || error || !originalBlob || !mimeType) {
    return (
      <div className={`${styles.root} ${styles.wrapper}`} data-theme={theme}>
        <div className={styles.system}>
          {loading && <Loader style={{ width: 48, height: 48 }} />}
          {error && <div className={styles.textRed}>{error}</div>}
          {!loading && !error && (!originalBlob || !mimeType) && (
            <div className={styles.textRed}>
              {defaultTranslations?.msgFailedToLoadImage ||
                "msgFailedToLoadImage"}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <PixediProvider
      mimeType={mimeType}
      width={width}
      height={height}
      originalBlob={originalBlob}
      previewUrl={previewUrl}
      isAlpha={isAlpha}
      settings={defaultSettings}
      translations={defaultTranslations}
      onSave={onSave}
      onBack={onBack}
    >
      <div
        ref={setWrapper}
        className={`${styles.root} ${styles.wrapper}`}
        data-theme={theme}
      >
        {defaultSettings?.tools?.includes(ActionName.FILTERS) && <UrlFilters />}

        {defaultSettings?.tools?.length === 1 ? (
          <div className={styles.gridSingleTool}>
            <Frame />
          </div>
        ) : (
          <div
            className={`${
              defaultSettings?.infobar ? styles.grid : styles.gridNoInfobar
            } ${isBelowSm ? styles.mobile : ""}`}
          >
            <Header isMobile={isBelowSm} />
            <Sidebar isMobile={isBelowSm} />
            <Frame />
            {defaultSettings?.infobar && <Infobar />}
          </div>
        )}
      </div>
    </PixediProvider>
  );
};
