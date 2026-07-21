import type { Meta, StoryObj } from "@storybook/react";
import { Separator } from "./Separator";

const meta = {
  title: "ImageEditor/UI/Separator",
  component: Separator,
  tags: ["autodocs"],
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  args: {
    orientation: "horizontal",
  },
  decorators: [
    (Story) => (
      <div style={{ width: 200 }}>
        <Story />
      </div>
    ),
  ],
};

export const Vertical: Story = {
  args: {
    orientation: "vertical",
  },
  decorators: [
    (Story) => (
      <div style={{ height: 100, display: "flex" }}>
        <Story />
      </div>
    ),
  ],
};
