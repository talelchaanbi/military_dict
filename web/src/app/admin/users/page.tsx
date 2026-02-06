import { Shell } from "@/components/layout/Shell";
import { requireRole } from "@/lib/auth";
import AdminUsersClient from "./users-client";

export default async function AdminUsersPage() {
  await requireRole(["admin"]);
  return (
    <Shell title="إدارة المستخدمين" backTo="/sections">
      <AdminUsersClient />
    </Shell>
  );
}
