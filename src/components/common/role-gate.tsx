"use client";

import { useSession } from "next-auth/react";

import type { AdminRole } from "@/types/api";

export function RoleGate({
  allow,
  children,
}: {
  allow: AdminRole[];
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  if (!session?.role || !allow.includes(session.role)) {
    return null;
  }
  return <>{children}</>;
}
