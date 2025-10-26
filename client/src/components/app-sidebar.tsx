import { useState } from "react";
import { Home, Trophy, User, Edit } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChangeAvatarDialog } from "@/components/change-avatar-dialog";
import type { User as UserType } from "@shared/schema";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Leaderboard",
    url: "/leaderboard",
    icon: Trophy,
  },
];

interface AppSidebarProps {
  user?: UserType;
}

export function AppSidebar({ user }: AppSidebarProps) {
  const [location] = useLocation();
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);

  const getDisplayName = () => {
    if (!user) return "Student";
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) return user.firstName;
    return "Student";
  };

  const getInitials = () => {
    if (!user) return "S";
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.firstName) return user.firstName[0].toUpperCase();
    return "S";
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Avatar className="w-10 h-10">
              <AvatarImage
                src={user?.profileImageUrl || undefined}
                alt={getDisplayName()}
                className="object-cover"
              />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <Button
              size="icon"
              variant="ghost"
              className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-background border shadow-sm hover:bg-accent"
              onClick={() => setShowAvatarDialog(true)}
              data-testid="button-change-avatar"
            >
              <Edit className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{getDisplayName()}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`link-${item.title.toLowerCase()}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {user && showAvatarDialog && (
        <ChangeAvatarDialog
          open={showAvatarDialog}
          onClose={() => setShowAvatarDialog(false)}
          currentUser={user}
        />
      )}
    </Sidebar>
  );
}
