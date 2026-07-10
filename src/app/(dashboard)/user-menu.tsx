"use client";

import { LogOut, UserRound } from "lucide-react";
import { signOut } from "@/app/(auth)/actions";
import { getInitials } from "@/lib/user-display";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeMenuItems } from "@/components/theme-menu-items";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function UserMenu({
  name,
  email,
}: {
  name: string | null;
  email: string;
}) {
  const initials = getInitials(name);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-muted">
        <Avatar size="sm">
          <AvatarFallback className="bg-primary-strong text-primary-foreground">
            {initials || <UserRound className="size-4" />}
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-medium">
            {name || "Complete seu perfil"}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {email}
          </span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <ThemeMenuItems />
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
