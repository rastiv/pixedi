import type { Meta, StoryObj } from "@storybook/react";
import { Tooltip } from "./Tooltip";

const meta = {
  title: "Pixedi/UI/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ padding: "80px", display: "inline-block" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

const itemStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "40px",
  height: "40px",
  cursor: "pointer",
  background: "#eee",
  border: "1px solid #ccc",
  borderRadius: "4px",
} as const;

const items = [
  <div key="resize" data-tooltip="Resize" style={itemStyle}>
    A
  </div>,
  <div key="crop" data-tooltip="Crop" style={itemStyle}>
    B
  </div>,
  <div key="presets" data-tooltip="Presets" style={itemStyle}>
    C
  </div>,
  <div key="flip" data-tooltip="Flip" style={itemStyle}>
    D
  </div>,
  <div key="rotate" data-tooltip="Rotate" style={itemStyle}>
    E
  </div>,
];

export const Top: Story = {
  args: { children: null },
  render: (args) => (
    <Tooltip {...args} position="top">
      {items}
    </Tooltip>
  ),
};

export const Bottom: Story = {
  args: { children: null },
  render: (args) => (
    <Tooltip {...args} position="bottom">
      {items}
    </Tooltip>
  ),
};

export const Left: Story = {
  args: { children: null },
  render: (args) => (
    <Tooltip {...args} position="left">
      {items}
    </Tooltip>
  ),
};

export const Right: Story = {
  args: { children: null },
  render: (args) => (
    <Tooltip {...args} position="right">
      {items}
    </Tooltip>
  ),
};
