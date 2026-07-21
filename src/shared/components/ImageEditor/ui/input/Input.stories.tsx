import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Input } from "./Input";

const meta = {
  title: "ImageEditor/UI/Input",
  component: Input,
  tags: ["autodocs"],
  args: {
    placeholder: "Type here...",
    onChange: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {
  args: {
    type: "text",
    value: "Sample text",
  },
};

export const Number: Story = {
  args: {
    type: "number",
    value: 42,
  },
};

export const NumberWithArrows: Story = {
  args: {
    type: "number",
    hideArrows: false,
    value: 42,
  },
};
