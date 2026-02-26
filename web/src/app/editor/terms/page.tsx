import { Shell } from "@/components/layout/Shell";
import { requireRole } from "@/lib/auth";
import TermsEditorClient from "./terms-client";

export default async function EditorTermsPage() {
  await requireRole(["editor"]);
  return (
    <Shell title="إدارة المصطلحات والرموز" backTo="/sections" fullWidth>
      <TermsEditorClient />
    </Shell>
  );
}
