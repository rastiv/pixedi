import { ImageEditorProvider } from "./provider/ImageEditorProvider";
import { useImageLoader } from "./hooks";
import { Header } from "./header";
import { Frame } from "./frame";
import { Sidebar } from "./sidebar";
import type { FuncSaveArgs, Theme, Settings } from "./types";
import { Loader } from "./assets/icons";
import styles from "./index.module.css";

type PixediProps = {
  image: string;
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
  settings = {},
}: PixediProps) => {
  const { loading, error, width, height, base64, extension } =
    useImageLoader(image);

  if (loading || error || !base64 || !extension) {
    return (
      <div className={`${styles.root} ${styles.wrapper}`} data-theme={theme}>
        <div className={styles.system}>
          {loading && <Loader style={{ width: 48, height: 48 }} />}
          {error && <div className={styles.textRed}>{error}</div>}
          {!loading && !error && (!base64 || !extension) && (
            <div className={styles.textRed}>Failed to load image.</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <ImageEditorProvider
      base64={base64}
      width={width}
      height={height}
      ext={extension}
      settings={settings}
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
    </ImageEditorProvider>
  );
};
