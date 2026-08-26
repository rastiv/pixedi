import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Slider } from "./Slider";

const meta: Meta<typeof Slider> = {
  title: "Pixedi/UI/Slider",
  component: Slider,
  args: {
    min: 0,
    max: 100,
    value: 50,
    step: 1,
  },
  argTypes: {
    onChange: { action: "changed" },
  },
};

export default meta;
type Story = StoryObj<typeof Slider>;

export const Default: Story = {};

export const WithStep: Story = {
  args: {
    min: 0,
    max: 100,
    value: 25,
    step: 5,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: 60,
  },
};

export const MinValue: Story = {
  args: {
    value: 0,
  },
};

export const MaxValue: Story = {
  args: {
    value: 100,
  },
};

const InteractiveTemplate = () => {
  const [value, setValue] = useState(50);
  return (
    <div style={{ width: 300 }}>
      <Slider min={0} max={100} value={value} onChange={setValue} />
      <p style={{ marginTop: 8 }}>Value: {value}</p>
    </div>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveTemplate />,
};
