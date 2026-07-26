import React from "react";
import ReactDOM from "react-dom/client";
import { injectCSS, removeCSS } from "virtual:css-injected-by-js";
import type { FuncSaveArgs } from "@/shared/components/ImageEditor/types";
import { Pixedi } from "@/shared/components/ImageEditor";

type WidgetTheme = "light" | "dark";

interface WidgetOptions {
  containerId: string;
  image: string;
  onSave: FuncSaveArgs;
  onBack: () => void;
  theme?: WidgetTheme;
}

interface ImageEditorWidgetInstance {
  destroy: () => void;
}

interface ImageEditorWidget {
  init: (options: WidgetOptions) => ImageEditorWidgetInstance | undefined;
}

interface ActiveWidget {
  root: ReactDOM.Root;
  shadowRoot: ShadowRoot;
  mountElement: HTMLDivElement;
}

declare global {
  interface Window {
    ImageEditorWidget?: ImageEditorWidget;
  }
}

let activeWidget: ActiveWidget | null = null;

const destroyActiveWidget = () => {
  if (!activeWidget) {
    return;
  }

  activeWidget.root.unmount();
  removeCSS({ target: activeWidget.shadowRoot });
  activeWidget.mountElement.remove();

  activeWidget = null;
};

const ImageEditorWidget: ImageEditorWidget = {
  init: (options) => {
    const container = document.getElementById(options.containerId);
    if (!container) return;

    destroyActiveWidget();

    let shadowRoot = container.shadowRoot;
    if (!shadowRoot) {
      try {
        shadowRoot = container.attachShadow({ mode: "open" });
      } catch {
        return;
      }
    }

    injectCSS({ target: shadowRoot });

    const mountElement = document.createElement("div");
    shadowRoot.append(mountElement);

    const root = ReactDOM.createRoot(mountElement);
    activeWidget = {
      root,
      shadowRoot,
      mountElement,
    };

    root.render(
      <React.StrictMode>
        <Pixedi
          image={options.image}
          onSave={options.onSave}
          onBack={options.onBack}
          theme={options.theme}
        />
      </React.StrictMode>,
    );

    return {
      destroy: () => {
        if (activeWidget?.root === root) {
          destroyActiveWidget();
        }
      },
    };
  },
};

if (typeof window !== "undefined") {
  window.ImageEditorWidget = ImageEditorWidget;
}

export default ImageEditorWidget;
