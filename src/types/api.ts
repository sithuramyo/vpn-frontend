// Types mirror the Go backend's JSON responses 1:1 (see
// vpn-backend/internal/models). Keep field names in snake_case to match
// the wire format exactly instead of translating case at the boundary.

export type AdminRole = "ADMIN" | "OPERATOR" | "VIEWER";
export type AdminStatus = "ACTIVE" | "DISABLED";

export interface Admin {
  id: string;
  email: string;
  name: string;
  picture_url: string;
  role: AdminRole;
  status: AdminStatus;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

export type VPNUserStatus = "ACTIVE" | "DISABLED" | "EXPIRED";

export interface VPNUser {
  id: string;
  email: string;
  name: string;
  status: VPNUserStatus;
  expires_at?: string;
  traffic_limit_bytes: number;
  traffic_used_bytes: number;
  created_at: string;
  updated_at: string;
  devices?: VPNDevice[];
  access_keys?: AccessKey[];
}

export type DevicePlatform = "ANDROID" | "IOS" | "WINDOWS" | "MACOS";
export type DeviceStatus = "ACTIVE" | "DISABLED" | "REVOKED";

export interface VPNDevice {
  id: string;
  vpn_user_id: string;
  name: string;
  platform: DevicePlatform;
  status: DeviceStatus;
  last_seen_at?: string;
  created_at: string;
  updated_at: string;
  user?: VPNUser;
}

export type ServerStatus = "ONLINE" | "OFFLINE" | "DEGRADED" | "MAINTENANCE";

export interface VPNServer {
  id: string;
  name: string;
  hostname: string;
  public_ip: string;
  country: string;
  city: string;
  status: ServerStatus;
  vpn_port: number;
  tls_port: number;
  created_at: string;
  updated_at: string;
}

export interface ServerMetricPoint {
  id: string;
  vpn_server_id: string;
  cpu_usage: number;
  memory_usage: number;
  bandwidth_in: number;
  bandwidth_out: number;
  active_connections: number;
  recorded_at: string;
}

export interface ServerHealth {
  status: "healthy" | "degraded";
  cpu_usage: number;
  memory_usage: number;
  uptime_seconds: number;
  active_connections: number;
  shadowsocks_healthy: boolean;
  caddy_healthy: boolean;
}

export type AccessKeyStatus = "ACTIVE" | "REVOKED" | "EXPIRED";

export interface AccessKey {
  id: string;
  vpn_user_id: string;
  vpn_server_id: string;
  name: string;
  cipher: string;
  protocol: "SHADOWSOCKS";
  tcp_enabled: boolean;
  udp_enabled: boolean;
  websocket_enabled: boolean;
  websocket_path?: string;
  websocket_udp_path?: string;
  expires_at?: string;
  traffic_limit_bytes: number;
  traffic_used_bytes: number;
  status: AccessKeyStatus;
  created_at: string;
  updated_at: string;
  user?: VPNUser;
  server?: VPNServer;
}

export interface TransportOption {
  transport: string;
  url?: string;
  host?: string;
  port?: number;
  method?: string;
  password?: string;
}

export interface CrossPlatformConfig {
  "first-supported": TransportOption[];
  udp?: TransportOption;
}

export interface AccessKeyConfig {
  shadowsocks_uri: string;
  cross_platform: CrossPlatformConfig;
}

export interface AuditLog {
  id: string;
  admin_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  metadata?: Record<string, unknown>;
  ip_address: string;
  created_at: string;
  admin?: Admin;
}

export interface BandwidthDataPoint {
  timestamp: string;
  bytes_in: number;
  bytes_out: number;
  active_connections: number;
}

export interface UsageSummary {
  total_traffic_bytes: number;
  daily_bandwidth: BandwidthDataPoint[];
  monthly_bandwidth: BandwidthDataPoint[];
}

export interface UserUsage {
  user_id: string;
  name: string;
  email: string;
  traffic_used_bytes: number;
  traffic_limit_bytes: number;
}

export interface ServerUsage {
  server_id: string;
  name: string;
  traffic_used_bytes: number;
}

export interface DashboardSummary {
  total_users: number;
  active_users: number;
  active_devices: number;
  active_access_keys: number;
}

export interface PaginationMeta {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}

export interface ApiEnvelope<T> {
  data?: T;
  meta?: PaginationMeta;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}
