import type { ReactNode } from "react";
import { AuthConvexProvider } from "@/app/(auth)/AuthConvexProvider";
import { AdminShell } from "@/components/admin/AdminShell";

// /admin — platform control for Handiwork staff (see components/admin/AdminShell).
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthConvexProvider>
      <AdminShell>{children}</AdminShell>
    </AuthConvexProvider>
  );
}
