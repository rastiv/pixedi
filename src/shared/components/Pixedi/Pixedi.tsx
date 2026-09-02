import { useState } from "react";
import { PixediProvider } from "./provider/PixediProvider";
import { initialSettings } from "./provider/initialState";
import { useBellow, useImageLoader } from "./hooks";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { Infobar } from "./infobar";
import { Frame } from "./frame";
import { Loader } from "./assets/icons";
import type { FuncSaveArgs, Theme, Settings } from "./types";
import styles from "./index.module.css";

type PixediProps = {
  image: string | Blob;
  onSave: FuncSaveArgs;
  onBack: () => void;
  theme?: Theme;
  settings?: Settings;
};

export const Pixedi = ({
  image,
  onSave,
  onBack,
  theme = "light",
  settings = initialSettings,
}: PixediProps) => {
  const [wrapper, setWrapper] = useState<HTMLDivElement | null>(null);
  const isBellowSm = useBellow("sm", wrapper);
  const defaultSettings = { ...initialSettings, ...settings };
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
          <div className={styles.textRed}>No tools selected.</div>
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
            <div className={styles.textRed}>Failed to load image.</div>
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
    >
      <div
        ref={setWrapper}
        className={`${styles.root} ${styles.wrapper}`}
        data-theme={theme}
      >
        <div
          className={`${
            defaultSettings?.infobar ? styles.grid : styles.gridNoInfobar
          } ${isBellowSm ? styles.mobile : ""}`}
        >
          <Header onSave={onSave} onBack={onBack} isMobile={isBellowSm} />
          <Sidebar isMobile={isBellowSm} />
          {defaultSettings?.infobar && <Infobar />}
          <Frame />
        </div>
      </div>
    </PixediProvider>
  );
};
