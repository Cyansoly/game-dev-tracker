"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";

const LS_WORKSPACE_ID = "devtracker_workspace_id";
const LS_LOCAL_USERNAME = "devtracker_local_username";

export default function WorkspaceGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (pathname === "/join") {
      setChecked(true);
      return;
    }

    const workspaceId = localStorage.getItem(LS_WORKSPACE_ID);
    const localUserName = localStorage.getItem(LS_LOCAL_USERNAME);

    if (!workspaceId || !localUserName) {
      router.replace("/join");
      return;
    }

    setChecked(true);
  }, [pathname, router]);

  if (pathname === "/join") {
    return <>{children}</>;
  }

  if (!checked) {
    return null;
  }

  return <AppShell>{children}</AppShell>;
}