import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { SelectIcon } from "./SelectIcon";
import { shapes } from "../../constants/shapes";

const items = Object.entries(shapes).map(([value, label]) => ({
  value,
  label,
}));

const meta = {
  title: "Pixedi/UI/SelectIcon",
  component: SelectIcon,
  tags: ["autodocs"],
  args: {
    items,
    value: "heart",
    onChange: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: 300, maxWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
  // keeps the picked icon in sync with the trigger while clicking around
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return (
      <SelectIcon
        {...args}
        value={value}
        onChange={(next) => {
          setValue(next);
          args.onChange(next);
        }}
      />
    );
  },
} satisfies Meta<typeof SelectIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Shapes: Story = {};

export const FourColumns: Story = {
  args: {
    gridCols: 4,
  },
};
