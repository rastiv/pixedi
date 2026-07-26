import { Preloader } from "@/shared/components/ui";
import { ImageEditorProvider } from "./provider/ImageEditorProvider";
import { useImageLoader } from "./hooks";
import { Header } from "./header";
import { Frame } from "./frame";
import { Sidebar } from "./sidebar";
import type { FuncSaveArgs } from "./types";
import styles from "./index.module.css";

export type ImageEditorTheme = "light" | "dark";

type ImageEditorProps = {
  image: string;
  onSave: FuncSaveArgs;
  onBack: () => void;
  theme?: ImageEditorTheme;
};

export const ImageEditor = ({
  image,
  onSave,
  onBack,
  theme = "light",
}: ImageEditorProps) => {
  const { loading, error, width, height, base64, extension } =
    useImageLoader(image);

  if (loading || error || !base64 || !extension) {
    return (
      <div className={`${styles.root} ${styles.system}`} data-theme={theme}>
        {loading && <Preloader size={48} />}
        {error && <div className={styles.textRed}>{error}</div>}
        {!loading && !error && (!base64 || !extension) && (
          <div className={styles.textRed}>Failed to load image.</div>
        )}
      </div>
    );
  }

  return (
    <ImageEditorProvider
      base64={base64}
      width={width}
      height={height}
      ext={extension}
    >
      <div className={`${styles.root} ${styles.main}`} data-theme={theme}>
        <Header onSave={onSave} onBack={onBack} />
        <div className={styles.grid}>
          <Frame />
          <Sidebar />
        </div>
      </div>
    </ImageEditorProvider>
  );
};
