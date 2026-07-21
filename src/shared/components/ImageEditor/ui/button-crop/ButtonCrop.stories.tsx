import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { ButtonCrop } from "./ButtonCrop";
import { Crop } from "../../assets/icons";

const meta = {
  title: "ImageEditor/UI/ButtonCrop",
  component: ButtonCrop,
  tags: ["autodocs"],
  args: {
    icon: <Crop />,
    label: "Crop",
    onClick: fn(),
  },
} satisfies Meta<typeof ButtonCrop>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Inactive: Story = {};

export const Active: Story = {
  args: {
    active: true,
  },
};
