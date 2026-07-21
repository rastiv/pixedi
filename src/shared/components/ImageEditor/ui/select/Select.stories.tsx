import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Select, type SelectOption } from "./Select";

const items = [
  { value: "1", label: "Small" },
  { value: "2", label: "Medium" },
  { value: "3", label: "Large" },
];

const groupedItems = [
  {
    label: "Sizes",
    options: [
      { value: "s", label: "Small", rightLabel: "S" },
      { value: "m", label: "Medium", rightLabel: "M" },
      { value: "l", label: "Large", rightLabel: "L" },
    ],
  },
  {
    label: "Formats",
    options: [
      { value: "jpg", label: "JPEG" },
      { value: "png", label: "PNG" },
      { value: "webp", label: "WebP" },
    ],
  },
] as SelectOption[];

const meta = {
  title: "ImageEditor/UI/Select",
  component: Select,
  tags: ["autodocs"],
  args: {
    items,
    value: "1",
    placeholder: "Select an option",
    onChange: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: 300, maxWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleItems: Story = {};

export const GroupedItems: Story = {
  args: {
    items: groupedItems,
    value: "m",
  },
};

export const CustomRenderOption: Story = {
  args: {
    renderOption: (option) => (
      <strong style={{ color: "#60a5fa" }}>{option.label}</strong>
    ),
  },
};
