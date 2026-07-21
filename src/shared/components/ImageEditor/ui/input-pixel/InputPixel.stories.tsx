import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { InputPixel } from "./InputPixel";

const meta = {
  title: "ImageEditor/UI/InputPixel",
  component: InputPixel,
  tags: ["autodocs"],
  args: {
    label: "Width",
    value: 120,
    onChange: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InputPixel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
  args: {
    label: "Height",
    value: 240,
  },
};
