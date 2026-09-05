import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const mockSignIn = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock("next-auth/react", () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
}));

import LoginPage from "@/app/login/page";

describe("LoginPage", () => {
  it("renders a Continue with Google button", () => {
    render(<LoginPage />);
    expect(screen.getByRole("button", { name: /continue with google/i })).toBeInTheDocument();
  });

  it("calls signIn('google') when clicked", async () => {
    render(<LoginPage />);
    await userEvent.click(screen.getByRole("button", { name: /continue with google/i }));
    expect(mockSignIn).toHaveBeenCalledWith("google", expect.objectContaining({ callbackUrl: "/dashboard" }));
  });

  it("shows the not-authorized message when redirected with that error", () => {
    mockSearchParams.set("error", "NotAuthorized");
    render(<LoginPage />);
    expect(
      screen.getByText(/your google account is not authorized to access this system/i)
    ).toBeInTheDocument();
    mockSearchParams.delete("error");
  });
});
