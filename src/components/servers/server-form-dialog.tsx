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
import { useCreateServer } from "@/hooks/useServers";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  hostname: z.string().min(1, "Hostname is required"),
  public_ip: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  vpn_port: z.coerce.number().min(1).max(65535),
  tls_port: z.coerce.number().min(1).max(65535),
});

type FormValues = z.infer<typeof schema>;

export function ServerFormDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const createServer = useCreateServer();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      hostname: "vpn.thestrm.space",
      public_ip: "",
      country: "Singapore",
      city: "Singapore",
      vpn_port: 17508,
      tls_port: 443,
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      await createServer.mutateAsync(values);
      toast.success("Server created");
      form.reset();
      onOpenChange(false);
    } catch {
      // toast surfaced globally
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add server</DialogTitle>
          <DialogDescription>Register a new VPN server for monitoring and key provisioning.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Singapore" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hostname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hostname</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vpn_port"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VPN port</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={(field.value as number | string | undefined) ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tls_port"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>TLS port</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={(field.value as number | string | undefined) ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createServer.isPending}>
                Add server
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
