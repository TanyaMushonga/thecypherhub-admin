import { Plus, Home, Book, User, NotebookPen } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../components/ui/sidebar";
import LogoutBtn from "./logout-button";
import ArticlesBadge from "../othercomponents/articlesBadge";
import SubscribersBadge from "../othercomponents/subscribersBadge";

// Menu items.
const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Articles",
    url: "/articles",
    icon: Book,
  },
  {
    title: "Add Article",
    url: "/add-article",
    icon: Plus,
  },
  {
    title: "Subscribers",
    url: "/subscribers",
    icon: User,
  },
  {
    title: "Notes",
    url: "/notes",
    icon: NotebookPen ,
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <h1 className="text-md font-bold">The Cypher Hub</h1>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                  {item.title === "Articles" ? (
                    <SidebarMenuBadge>
                      <ArticlesBadge />
                    </SidebarMenuBadge>
                  ) : item.title === "Subscribers" ? (
                    <SidebarMenuBadge>
                      <SubscribersBadge />
                    </SidebarMenuBadge>
                  ) : null}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <div className="mt-auto p-4">
        <LogoutBtn />
      </div>
    </Sidebar>
  );
}
