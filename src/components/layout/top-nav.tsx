"use client";

import { signOut, useSession } from "next-auth/react";
import { LogOut, Menu } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNav } from "@/components/layout/sidebar-nav";

export function TopNav() {
  const { data: session } = useSession();

  const initials = (session?.user?.name ?? session?.user?.email ?? "?")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="flex h-14 items-center gap-3 border-b bg-background px-4 lg:px-6">
      <Sheet>
        <SheetTrigger render={<Button variant="ghost" size="icon" className="lg:hidden" />}>
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarNav />
        </SheetContent>
      </Sheet>

      <div className="flex-1" />

      {session?.role && (
        <Badge variant="secondary" className="hidden sm:inline-flex">
          {session.role}
        </Badge>
      )}

      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={session?.user?.image ?? undefined} alt={session?.user?.name ?? ""} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <span className="hidden text-sm font-medium sm:inline">{session?.user?.name}</span>
      </div>

      <Button variant="ghost" size="icon" onClick={() => signOut({ callbackUrl: "/login" })} title="Sign out">
        <LogOut className="h-4 w-4" />
      </Button>
    </header>
  );
}
