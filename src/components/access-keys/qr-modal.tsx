"use client";

import Image from "next/image";
import { Copy, Download } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccessKeyConfig, useAccessKeyQR } from "@/hooks/useAccessKeys";

export function QRModal({
  open,
  onOpenChange,
  accessKeyId,
  accessKeyName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accessKeyId: string;
  accessKeyName: string;
}) {
  const qr = useAccessKeyQR(accessKeyId, open);
  const config = useAccessKeyConfig(accessKeyId, open);

  async function copyConfig() {
    if (!config.data) return;
    await navigator.clipboard.writeText(config.data.shadowsocks_uri);
    toast.success("Configuration copied to clipboard");
  }

  function downloadQR() {
    if (!qr.data) return;
    const a = document.createElement("a");
    a.href = qr.data;
    a.download = `${accessKeyName || "access-key"}-qr.png`;
    a.click();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Scan to connect</DialogTitle>
          <DialogDescription>Scan this QR code with a compatible VPN client to import {accessKeyName}.</DialogDescription>
        </DialogHeader>

        <div className="flex justify-center py-4">
          {qr.isLoading || !qr.data ? (
            <Skeleton className="h-64 w-64" />
          ) : (
            <Image src={qr.data} alt="Access key QR code" width={256} height={256} unoptimized />
          )}
        </div>

        <DialogFooter className="sm:justify-center">
          <Button variant="outline" onClick={copyConfig} disabled={!config.data}>
            <Copy className="mr-2 h-4 w-4" />
            Copy configuration
          </Button>
          <Button variant="outline" onClick={downloadQR} disabled={!qr.data}>
            <Download className="mr-2 h-4 w-4" />
            Download QR
          </Button>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
