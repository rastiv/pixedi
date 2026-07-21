import React from "react";
import type { Preview } from "@storybook/react";
import "@/app/styles/index.css";
import "@/shared/components/ImageEditor/index.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  globalTypes: {
    theme: {
      description: "Global theme for components",
      defaultValue: "light",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "light", icon: "sun", title: "Light Mode" },
          { value: "dark", icon: "moon", title: "Dark Mode" },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const selectedTheme = context.globals.theme || "light";

      return React.createElement(
        "div",
        {
          "data-theme": selectedTheme,
          className: "root",
          style: {
            padding: 24,
            minHeight: "100vh",
            backgroundColor:
              selectedTheme === "dark" ? "#22252a" : "oklch(1 0 0)",
            transition: "background-color 0.2s ease",
          },
        },
        React.createElement(Story),
      );
    },
  ],
};

export default preview;
