import { afterEach, describe, expect, it, vi } from "vitest";

import { apiDelete, apiGet, ApiError, apiPost, messageForStatus } from "@/lib/api/client";

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("messageForStatus", () => {
  it.each([
    [401, /session has expired/i],
    [403, /permission/i],
    [404, /could not be found/i],
    [409, /conflict|already exists/i],
    [422, /form for errors/i],
    [429, /too many requests/i],
    [500, /server is unavailable/i],
  ])("maps status %i to a useful message", (status, pattern) => {
    expect(messageForStatus(status as number, "fallback")).toMatch(pattern);
  });

  it("falls back for unmapped statuses", () => {
    expect(messageForStatus(418, "fallback message")).toBe("fallback message");
  });
});

describe("apiGet", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("throws ApiError with UNAUTHORIZED when no token is present", async () => {
    await expect(apiGet("/api/v1/users", undefined)).rejects.toMatchObject({
      status: 401,
      code: "UNAUTHORIZED",
    });
  });

  it("returns the envelope's data on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse(200, { data: { id: "1", name: "Alice" } }))
    );

    const result = await apiGet<{ id: string; name: string }>("/api/v1/users/1", "token");
    expect(result).toEqual({ id: "1", name: "Alice" });
  });

  it("throws the backend's error code and message on failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse(409, { error: { code: "CONFLICT", message: "Access key already exists" } })
      )
    );

    await expect(apiGet("/api/v1/access-keys", "token")).rejects.toMatchObject({
      status: 409,
      code: "CONFLICT",
      message: "Access key already exists",
    });
  });

  it("is an instance of ApiError", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(500, {})));
    try {
      await apiGet("/api/v1/users", "token");
      expect.unreachable("expected apiGet to throw");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
    }
  });
});

describe("apiPost / apiDelete", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends a JSON body and Authorization header", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(201, { data: { id: "1" } }));
    vi.stubGlobal("fetch", fetchMock);

    await apiPost("/api/v1/users", "token", { name: "Alice" });

    const [, options] = fetchMock.mock.calls[0];
    expect(options.method).toBe("POST");
    expect(options.headers.Authorization).toBe("Bearer token");
    expect(JSON.parse(options.body)).toEqual({ name: "Alice" });
  });

  it("treats 204 responses as success with no data", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
    await expect(apiDelete("/api/v1/users/1", "token")).resolves.toBeUndefined();
  });
});
