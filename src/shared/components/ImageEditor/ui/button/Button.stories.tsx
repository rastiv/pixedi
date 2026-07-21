import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Button } from "./Button";
import { Check } from "../../assets/icons";

const meta = {
  title: "ImageEditor/UI/Button",
  component: Button,
  tags: ["autodocs"],
  args: {
    children: "Button",
    onClick: fn(),
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Outline: Story = {
  args: {
    variant: "outline",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
  },
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Check />
        Button
      </>
    ),
  },
};
