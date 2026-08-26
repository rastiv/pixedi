import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { SaveCloseGroup } from "./SaveCloseGroup";

const meta = {
  title: "Pixedi/UI/SaveCloseGroup",
  component: SaveCloseGroup,
  tags: ["autodocs"],
  args: {
    onSave: fn(),
    onClose: fn(),
  },
} satisfies Meta<typeof SaveCloseGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Saving: Story = {
  args: {
    saving: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
