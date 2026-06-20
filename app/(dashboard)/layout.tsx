"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, getStoredToken } from "@/lib/auth";
import { useAppStore } from "@/store/appStore";
import Sidebar from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const setUser = useAppStore((s) => s.setUser);
  const isSidebarOpen = useAppStore((s) => s.isSidebarOpen);

  useEffect(() => {
    const token = getStoredToken();
    const user = getStoredUser();

    if (!token || !user) {
      router.push("/login");
      return;
    }

    setUser(user);
  }, [router, setUser]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <main
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
          isSidebarOpen ? "ml-0" : "ml-0"
        }`}
      >
        {children}
      </main>
    </div>
  );
}