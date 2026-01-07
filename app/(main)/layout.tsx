import type { Metadata } from "next";
import { validateRequest } from "../../auth";
import { redirect } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "../../components/ui/sidebar";
import { AppSidebar } from "../../components/ui/app-sidebar";
import { cookies } from "next/headers";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Cypher Space | Dashboard",
  description: "A Dashboard for Cypher Space",
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await validateRequest();

  if (!session.user) redirect("/login");
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <main className="bg-primary h-[100vh] w-full">
        <div className="flex md:items-center w-full bg-blue-950 p-5">
          <SidebarTrigger className="text-white" />
          <div className="flex flex-col gap-4 md:flex-row justify-between items-center md:mx-10 w-full">
            <h1 className="text-center text-xl md:text-3xl text-white font-bold">
              The Cypher Hub Dashboard
            </h1>
          </div>
        </div>
        <Toaster />
        {children}
      </main>
    </SidebarProvider>
  );
}
