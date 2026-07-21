import { Preloader } from "@/shared/components/ui";
import { ImageEditorProvider } from "./provider/ImageEditorProvider";
import { useImageLoader } from "./hooks";
import { Header } from "./header";
import { Frame } from "./frame";
import { Sidebar } from "./sidebar";
import type { FuncSaveArgs } from "./types";
import "./index.css";

type ImageEditorProps = {
  image: string;
  onSave: FuncSaveArgs;
  onBack: () => void;
};

export const ImageEditor = ({ image, onSave, onBack }: ImageEditorProps) => {
  const { loading, error, width, height, base64, extension } =
    useImageLoader(image);

  if (loading || error || !base64 || !extension) {
    return (
      <div className="picedi sys">
        {loading && <Preloader size={48} />}
        {error && <div className="text-red">{error}</div>}
        {!loading && !error && (!base64 || !extension) && (
          <div className="text-red">Failed to load image.</div>
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
      <div className="picedi main">
        <Header onSave={onSave} onBack={onBack} />
        <div className="grid">
          <Frame />
          <Sidebar />
        </div>
      </div>
    </ImageEditorProvider>
  );
};
