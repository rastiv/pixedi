import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Preview } from "../preview";
import { PixediProvider } from "../provider/PixediProvider";
import { usePixediContext } from "../provider/usePixediContext";
import SidebarRotate from "./SidebarRotate";

const EditorState = () => {
  const { currentAction, sidebar } = usePixediContext();

  return (
    <output aria-label="Editor state">
      {JSON.stringify({ currentAction, sidebar })}
    </output>
  );
};

describe("SidebarRotate", () => {
  it("enters rotate mode with a zero-degree action", () => {
    render(
      <PixediProvider
        extension="png"
        reducedBase64="data:image/png;base64,initial"
        originalBase64="data:image/png;base64,initial"
        originalSize={1234}
        width={800}
        height={600}
        settings={{}}
        isAlpha={false}
      >
        <SidebarRotate />
        <Preview />
        <EditorState />
      </PixediProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Rotate" }));

    expect(
      screen.getByRole("status", { name: "Editor state" }),
    ).toHaveTextContent(
      JSON.stringify({
        currentAction: { name: "rotate", args: { degrees: 0 } },
        sidebar: false,
      }),
    );
    expect(
      screen.getByRole("img", { name: "Preview Image" }),
    ).toBeInTheDocument();
  });
});
