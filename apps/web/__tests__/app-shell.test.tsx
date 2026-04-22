import { render, screen } from "@testing-library/react";
import { AppShell } from "@/components/app-shell";

describe("AppShell", () => {
  it("renders navigation and content", () => {
    render(<AppShell currentPath="/"><div>Overview content</div></AppShell>);

    expect(screen.getByText("SupplyPilot")).toBeInTheDocument();
    expect(screen.getByText("Overview content")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /inventory/i })).toBeInTheDocument();
  });
});
