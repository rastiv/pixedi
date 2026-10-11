import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { OrbitalSelector } from "./OrbitalSelector";

const quarterAngles = [0, 90, 180, 270];
const octantAngles = [0, 45, 90, 135, 180, 225, 270, 315];

const meta = {
  title: "Pixedi/UI/OrbitalSelector",
  component: OrbitalSelector,
  tags: ["autodocs"],
  args: {
    value: 0,
    angles: octantAngles,
    onChange: fn(),
    onInput: fn(),
  },
  argTypes: {
    value: { control: { type: "range", min: 0, max: 359, step: 1 } },
  },
  decorators: [
    // the track is a translucent white ring meant to sit on top of a photo
    (Story) => (
      <div
        style={{
          width: 320,
          padding: 24,
          borderRadius: 8,
          background:
            "linear-gradient(135deg, #3a4a3f 0%, #6b5b45 50%, #2f3a4a 100%)",
        }}
      >
        <Story />
      </div>
    ),
  ],
  // keeps the thumb and the readout in sync while dragging or clicking points
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return (
      <OrbitalSelector
        {...args}
        value={value}
        onInput={(next) => {
          setValue(next);
          args.onInput?.(next);
        }}
        onChange={(next) => {
          setValue(next);
          args.onChange?.(next);
        }}
      >
        {args.children ?? (
          <output
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 600,
              color: "var(--color-white)",
            }}
          >
            {value}°
          </output>
        )}
      </OrbitalSelector>
    );
  },
} satisfies Meta<typeof OrbitalSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Rotated: Story = {
  args: {
    value: 105,
  },
};

export const QuarterTurns: Story = {
  args: {
    angles: quarterAngles,
    value: 90,
  },
};

export const WithoutPresets: Story = {
  args: {
    angles: [],
    value: 30,
  },
};

export const CustomContent: Story = {
  args: {
    value: 225,
    children: (
      <div
        style={{
          padding: "6px 12px",
          borderRadius: 4,
          background: "var(--background)",
          color: "var(--accent-blue)",
          fontFamily: "var(--font-mono)",
          fontWeight: 600,
        }}
      >
        Drag the thumb
      </div>
    ),
  },
};
