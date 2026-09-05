import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatusBadge } from "@/components/common/status-badge";

describe("StatusBadge", () => {
  it("renders ACTIVE as a good-tone badge", () => {
    render(<StatusBadge status="ACTIVE" />);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("renders REVOKED distinctly from ACTIVE", () => {
    render(<StatusBadge status="REVOKED" />);
    expect(screen.getByText("Revoked")).toBeInTheDocument();
  });

  it("falls back to a neutral badge for unknown statuses", () => {
    render(<StatusBadge status="SOMETHING_UNKNOWN" />);
    expect(screen.getByText(/something_unknown/i)).toBeInTheDocument();
  });
});
