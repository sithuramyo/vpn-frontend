import {
  LayoutDashboard,
  Users,
  Smartphone,
  KeyRound,
  Server,
  BarChart3,
  ScrollText,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/users", label: "Users", icon: Users },
  { href: "/devices", label: "Devices", icon: Smartphone },
  { href: "/access-keys", label: "Access Keys", icon: KeyRound },
  { href: "/servers", label: "Servers", icon: Server },
  { href: "/usage", label: "Usage", icon: BarChart3 },
  { href: "/audit-logs", label: "Audit Logs", icon: ScrollText },
  { href: "/settings", label: "Settings", icon: Settings },
];
