import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { RoleGate } from "@/components/common/role-gate";

const mockUseSession = vi.fn();

vi.mock("next-auth/react", () => ({
  useSession: () => mockUseSession(),
}));

describe("RoleGate", () => {
  it("renders children when the session role is allowed", () => {
    mockUseSession.mockReturnValue({ data: { role: "ADMIN" } });
    render(
      <RoleGate allow={["ADMIN", "OPERATOR"]}>
        <button>Create user</button>
      </RoleGate>
    );
    expect(screen.getByText("Create user")).toBeInTheDocument();
  });

  it("renders nothing when the session role is not allowed", () => {
    mockUseSession.mockReturnValue({ data: { role: "VIEWER" } });
    render(
      <RoleGate allow={["ADMIN", "OPERATOR"]}>
        <button>Create user</button>
      </RoleGate>
    );
    expect(screen.queryByText("Create user")).not.toBeInTheDocument();
  });

  it("renders nothing when there is no session yet", () => {
    mockUseSession.mockReturnValue({ data: undefined });
    render(
      <RoleGate allow={["ADMIN"]}>
        <button>Create user</button>
      </RoleGate>
    );
    expect(screen.queryByText("Create user")).not.toBeInTheDocument();
  });
});
