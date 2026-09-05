// Per-admin VPN defaults used to pre-fill the "create access key" form.
// The backend has no endpoint for these - they're a pure UI convenience,
// so they live in localStorage rather than adding server-side state for a
// preference that carries no security meaning.
export interface VpnDefaults {
  serverId?: string;
  protocol: "SHADOWSOCKS";
  expirationDays?: number;
  trafficLimitGb?: number;
}

const STORAGE_KEY = "vpn-admin:vpn-defaults";

export function loadVpnDefaults(): VpnDefaults {
  if (typeof window === "undefined") return { protocol: "SHADOWSOCKS" };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { protocol: "SHADOWSOCKS" };
    return { protocol: "SHADOWSOCKS", ...JSON.parse(raw) };
  } catch {
    return { protocol: "SHADOWSOCKS" };
  }
}

export function saveVpnDefaults(defaults: VpnDefaults) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
}
