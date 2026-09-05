"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useServers } from "@/hooks/useServers";
import { loadVpnDefaults, saveVpnDefaults, type VpnDefaults } from "@/lib/vpn-defaults";

export default function SettingsPage() {
  const { data: session } = useSession();
  const servers = useServers({ page_size: 50 });
  const [defaults, setDefaults] = useState<VpnDefaults>(() => loadVpnDefaults());

  function updateDefaults(patch: Partial<VpnDefaults>) {
    const next = { ...defaults, ...patch };
    setDefaults(next);
    saveVpnDefaults(next);
    toast.success("VPN defaults saved");
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">Your profile, session, and VPN defaults.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription>Synced from your Google account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={session?.user?.image ?? undefined} alt={session?.user?.name ?? ""} />
              <AvatarFallback>{session?.user?.name?.[0] ?? "?"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{session?.user?.name}</p>
              <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
            </div>
            {session?.role && <Badge variant="secondary" className="ml-auto">{session.role}</Badge>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Security</CardTitle>
          <CardDescription>Manage your current session.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Current session</span>
            <span>Signed in via Google</span>
          </div>
          <Separator />
          <Button variant="outline" onClick={() => signOut({ callbackUrl: "/login" })}>
            Sign out
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">VPN Defaults</CardTitle>
          <CardDescription>Pre-fill values when creating a new access key. Stored on this device only.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Default server</Label>
            <Select value={defaults.serverId ?? ""} onValueChange={(v) => updateDefaults({ serverId: v ?? undefined })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="No default" />
              </SelectTrigger>
              <SelectContent>
                {servers.data?.data.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Default protocol</Label>
            <Input value="Shadowsocks" disabled />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Default expiration (days)</Label>
              <Input
                type="number"
                min={0}
                value={defaults.expirationDays ?? ""}
                onChange={(e) => updateDefaults({ expirationDays: Number(e.target.value) || undefined })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Default traffic limit (GB)</Label>
              <Input
                type="number"
                min={0}
                step="0.1"
                value={defaults.trafficLimitGb ?? ""}
                onChange={(e) => updateDefaults({ trafficLimitGb: Number(e.target.value) || undefined })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
