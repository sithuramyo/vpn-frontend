"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
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
import { useCreateUser, useUpdateUser } from "@/hooks/useUsers";
import type { VPNUser } from "@/types/api";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  expires_at: z.string().optional(),
  traffic_limit_gb: z.coerce.number().min(0).optional(),
});

type FormValues = z.infer<typeof schema>;

function toDateInputValue(iso?: string): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export function UserFormDialog({
  open,
  onOpenChange,
  user,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: VPNUser;
}) {
  const isEdit = !!user;
  const createUser = useCreateUser();
  const updateUser = useUpdateUser(user?.id ?? "");

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      expires_at: toDateInputValue(user?.expires_at),
      traffic_limit_gb: user ? Math.round((user.traffic_limit_bytes / 1_000_000_000) * 100) / 100 : undefined,
    },
  });

  useEffect(() => {
    form.reset({
      name: user?.name ?? "",
      email: user?.email ?? "",
      expires_at: toDateInputValue(user?.expires_at),
      traffic_limit_gb: user ? Math.round((user.traffic_limit_bytes / 1_000_000_000) * 100) / 100 : undefined,
    });
  }, [user, form]);

  async function onSubmit(values: FormValues) {
    const traffic_limit_bytes = values.traffic_limit_gb
      ? Math.round(values.traffic_limit_gb * 1_000_000_000)
      : 0;
    const expires_at = values.expires_at ? new Date(values.expires_at).toISOString() : undefined;

    try {
      if (isEdit) {
        await updateUser.mutateAsync({
          name: values.name,
          email: values.email,
          traffic_limit_bytes,
          expires_at,
          clear_expires_at: !values.expires_at,
        });
        toast.success("User updated");
      } else {
        await createUser.mutateAsync({ name: values.name, email: values.email, traffic_limit_bytes, expires_at });
        toast.success("User created");
      }
      onOpenChange(false);
    } catch {
      // MutationCache already surfaces the error toast.
    }
  }

  const pending = createUser.isPending || updateUser.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit user" : "Create user"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update this VPN user's details." : "Add a new VPN user."}
          </DialogDescription>
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
                    <Input placeholder="Jane Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="jane@example.com" type="email" {...field} />
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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {isEdit ? "Save changes" : "Create user"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
