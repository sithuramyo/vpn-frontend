"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Download, Eye, EyeOff, QrCode, RotateCw, ShieldOff } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState, LoadingRows } from "@/components/common/states";
import { RoleGate } from "@/components/common/role-gate";
import { StatusBadge } from "@/components/common/status-badge";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { QRModal } from "@/components/access-keys/qr-modal";
import { useAccessKey, useAccessKeyConfig, useRevokeAccessKey, useRotateAccessKey } from "@/hooks/useAccessKeys";
import { formatBytes, formatDateShort } from "@/lib/format";

export default function AccessKeyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: key, isLoading, isError, refetch } = useAccessKey(id);
  const [revealed, setRevealed] = useState(false);
  const config = useAccessKeyConfig(id, revealed);
  const [qrOpen, setQrOpen] = useState(false);
  const [revokeOpen, setRevokeOpen] = useState(false);

  const revoke = useRevokeAccessKey();
  const rotate = useRotateAccessKey();

  if (isLoading) return <LoadingRows count={8} />;
  if (isError || !key) return <ErrorState onRetry={() => refetch()} />;

  async function copyValue(value: string, label: string) {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  }

  function downloadConfig() {
    if (!config.data) return;
    const blob = new Blob([JSON.stringify(config.data.cross_platform, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${key!.name || "access-key"}-config.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function confirmRevoke() {
    try {
      await revoke.mutateAsync(id);
      toast.success("Access key revoked");
      setRevokeOpen(false);
    } catch {
      // toast surfaced globally
    }
  }

  async function doRotate() {
    try {
      await rotate.mutateAsync(id);
      toast.success("Access key rotated");
      setRevealed(false);
    } catch {
      // toast surfaced globally
    }
  }

  const wssEndpoint = config.data?.cross_platform["first-supported"].find((o) => o.transport === "wss")?.url;
  const fallbackOption = config.data?.cross_platform["first-supported"].find((o) => o.transport === "shadowsocks");
  const fallbackEndpoint = fallbackOption ? `${fallbackOption.host}:${fallbackOption.port}` : undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" render={<Link href="/access-keys" />}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">{key.name}</h1>
          <p className="text-sm text-muted-foreground">
            {key.user?.name} &middot; {key.server?.name}
          </p>
        </div>
        <StatusBadge status={key.status} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Created</CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-semibold">{formatDateShort(key.created_at)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Expiration</CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-semibold">{formatDateShort(key.expires_at)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Traffic limit</CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-semibold">
            {key.traffic_limit_bytes > 0 ? formatBytes(key.traffic_limit_bytes) : "Unlimited"}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Traffic used</CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-semibold">{formatBytes(key.traffic_used_bytes)}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Connection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2 text-sm">
            {key.websocket_enabled && <span className="rounded-full bg-muted px-2 py-0.5">WebSocket / WSS</span>}
            {key.tcp_enabled && <span className="rounded-full bg-muted px-2 py-0.5">TCP fallback</span>}
            {key.udp_enabled && <span className="rounded-full bg-muted px-2 py-0.5">UDP</span>}
          </div>

          {!revealed ? (
            <RoleGate allow={["ADMIN", "OPERATOR"]}>
              <Button variant="outline" onClick={() => setRevealed(true)}>
                <Eye className="mr-2 h-4 w-4" />
                Reveal secret
              </Button>
            </RoleGate>
          ) : (
            <div className="space-y-3">
              {config.isLoading && <LoadingRows count={2} />}
              {config.data && (
                <>
                  {wssEndpoint && (
                    <EndpointRow label="WSS endpoint" value={wssEndpoint} onCopy={() => copyValue(wssEndpoint, "WSS endpoint")} />
                  )}
                  {fallbackEndpoint && (
                    <EndpointRow
                      label="Shadowsocks endpoint (fallback)"
                      value={fallbackEndpoint}
                      onCopy={() => copyValue(fallbackEndpoint, "Shadowsocks endpoint")}
                    />
                  )}
                  <EndpointRow
                    label="ss:// configuration"
                    value={config.data.shadowsocks_uri}
                    onCopy={() => copyValue(config.data!.shadowsocks_uri, "Configuration")}
                  />
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => setQrOpen(true)}>
                      <QrCode className="mr-2 h-4 w-4" />
                      Generate QR
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadConfig}>
                      <Download className="mr-2 h-4 w-4" />
                      Download configuration
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setRevealed(false)}>
                      <EyeOff className="mr-2 h-4 w-4" />
                      Hide
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <RoleGate allow={["ADMIN", "OPERATOR"]}>
        <div className="flex gap-2">
          <Button variant="outline" onClick={doRotate} disabled={rotate.isPending}>
            <RotateCw className="mr-2 h-4 w-4" />
            Rotate
          </Button>
          <Button variant="destructive" onClick={() => setRevokeOpen(true)} disabled={key.status !== "ACTIVE"}>
            <ShieldOff className="mr-2 h-4 w-4" />
            Revoke
          </Button>
        </div>
      </RoleGate>

      <QRModal open={qrOpen} onOpenChange={setQrOpen} accessKeyId={id} accessKeyName={key.name} />

      <ConfirmDialog
        open={revokeOpen}
        onOpenChange={setRevokeOpen}
        title="Revoke access key?"
        description={`${key.name} will immediately stop working.`}
        confirmLabel="Revoke"
        pending={revoke.isPending}
        onConfirm={confirmRevoke}
      />
    </div>
  );
}

function EndpointRow({ label, value, onCopy }: { label: string; value: string; onCopy: () => void }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2">
        <code className="flex-1 truncate rounded-md bg-muted px-2 py-1.5 text-xs">{value}</code>
        <Button variant="ghost" size="icon-sm" onClick={onCopy}>
          <Copy className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
