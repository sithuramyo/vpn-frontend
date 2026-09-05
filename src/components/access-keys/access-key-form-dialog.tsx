"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCreateAccessKey } from "@/hooks/useAccessKeys";
import { useServers } from "@/hooks/useServers";
import { useUsers } from "@/hooks/useUsers";

const schema = z.object({
  vpn_user_id: z.string().min(1, "Select a user"),
  vpn_server_id: z.string().min(1, "Select a server"),
  name: z.string().min(1, "Name is required"),
  expires_at: z.string().optional(),
  traffic_limit_gb: z.coerce.number().min(0).optional(),
  tcp_enabled: z.boolean(),
  udp_enabled: z.boolean(),
  websocket_enabled: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export function AccessKeyFormDialog({
  open,
  onOpenChange,
  defaultUserId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultUserId?: string;
}) {
  const users = useUsers({ page_size: 100 });
  const servers = useServers({ page_size: 50 });
  const createKey = useCreateAccessKey();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      vpn_user_id: defaultUserId ?? "",
      vpn_server_id: "",
      name: "",
      expires_at: "",
      traffic_limit_gb: undefined,
      tcp_enabled: true,
      udp_enabled: true,
      websocket_enabled: true,
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      await createKey.mutateAsync({
        vpn_user_id: values.vpn_user_id,
        vpn_server_id: values.vpn_server_id,
        name: values.name,
        expires_at: values.expires_at ? new Date(values.expires_at).toISOString() : undefined,
        traffic_limit_bytes: values.traffic_limit_gb ? Math.round(values.traffic_limit_gb * 1_000_000_000) : 0,
        tcp_enabled: values.tcp_enabled,
        udp_enabled: values.udp_enabled,
        websocket_enabled: values.websocket_enabled,
      });
      toast.success("Access key created");
      form.reset();
      onOpenChange(false);
    } catch {
      // toast surfaced globally
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create access key</DialogTitle>
          <DialogDescription>Provision a new Shadowsocks credential for a user.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vpn_user_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User</FormLabel>
                    <Select
                      items={users.data?.data.map((u) => ({ value: u.id, label: u.name })) ?? []}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select user" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.data?.data.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vpn_server_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Server</FormLabel>
                    <Select
                      items={servers.data?.data.map((s) => ({ value: s.id, label: s.name })) ?? []}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select server" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {servers.data?.data.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Jane's laptop" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expires_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiration</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="traffic_limit_gb"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Traffic limit (GB)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="0.1"
                        placeholder="0 = unlimited"
                        {...field}
                        value={(field.value as number | string | undefined) ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="tcp_enabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-md border p-3">
                    <FormLabel className="mb-0">TCP</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="udp_enabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-md border p-3">
                    <FormLabel className="mb-0">UDP</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="websocket_enabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-md border p-3">
                    <FormLabel className="mb-0">WebSocket</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createKey.isPending}>
                Create access key
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
