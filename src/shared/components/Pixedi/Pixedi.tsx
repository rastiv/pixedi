import { PixediProvider } from "./provider/PixediProvider";
import { initialSettings } from "./provider/initialState";
import { useImageLoader } from "./hooks";
import { Header } from "./header";
import { Frame } from "./frame";
import { Sidebar } from "./sidebar";
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
      <div className={`${styles.root} ${styles.wrapper}`} data-theme={theme}>
        <div className={styles.main}>
          <Header onSave={onSave} onBack={onBack} />
          <div className={styles.grid}>
            <Sidebar />
            <Frame />
          </div>
        </div>
      </div>
    </PixediProvider>
  );
};
