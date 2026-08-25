import React from "react";
import ReactDOM from "react-dom/client";
import { injectCSS, removeCSS } from "virtual:css-injected-by-js";
import type { FuncSaveArgs, Settings } from "@/shared/components/Pixedi/types";
import { Pixedi } from "@/shared/components/Pixedi";

type WidgetTheme = "light" | "dark";

interface WidgetOptions {
  containerId: string;
  image: string | Blob;
  onSave: FuncSaveArgs;
  onBack: () => void;
  theme?: WidgetTheme;
  settings?: Settings;
}

interface PixediWidgetInstance {
  destroy: () => void;
}

interface PixediWidget {
  init: (options: WidgetOptions) => PixediWidgetInstance | undefined;
}

interface ActiveWidget {
  root: ReactDOM.Root;
  shadowRoot: ShadowRoot;
}

declare global {
  interface Window {
    PixediWidget?: PixediWidget;
  }
}

let activeWidget: ActiveWidget | null = null;

const destroyActiveWidget = () => {
  if (!activeWidget) {
    return;
  }

  activeWidget.root.unmount();
  removeCSS({ target: activeWidget.shadowRoot });

  activeWidget = null;
};

const PixediWidget: PixediWidget = {
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

    const root = ReactDOM.createRoot(shadowRoot as unknown as Element);
    activeWidget = {
      root,
      shadowRoot,
    };

    root.render(
      <React.StrictMode>
        <Pixedi
          image={options.image}
          onSave={options.onSave}
          onBack={options.onBack}
          theme={options.theme}
          settings={options.settings}
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
  window.PixediWidget = PixediWidget;
}

export default PixediWidget;
