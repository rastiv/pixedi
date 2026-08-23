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
  const {
    loading,
    error,
    extension,
    width,
    height,
    originalBlob,
    previewUrl,
    isAlpha,
  } = useImageLoader(image);

  if (loading || error || !originalBlob || !extension) {
    return (
      <div className={`${styles.root} ${styles.wrapper}`} data-theme={theme}>
        <div className={styles.system}>
          {loading && <Loader style={{ width: 48, height: 48 }} />}
          {error && <div className={styles.textRed}>{error}</div>}
          {!loading && !error && (!originalBlob || !extension) && (
            <div className={styles.textRed}>Failed to load image.</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <PixediProvider
      extension={extension}
      width={width}
      height={height}
      originalBlob={originalBlob}
      previewUrl={previewUrl}
      isAlpha={isAlpha}
      settings={{ ...initialSettings, ...settings }}
    >
      <div className={`${styles.root} ${styles.wrapper}`} data-theme={theme}>
        <div className={styles.main}>
          <Header onSave={onSave} onBack={onBack} />
          <div className={styles.grid}>
            <Frame />
            <Sidebar />
          </div>
        </div>
      </div>
    </PixediProvider>
  );
};
