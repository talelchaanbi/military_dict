import { Shell } from "@/components/layout/Shell";
import { requireRole } from "@/lib/auth";
import ProposalsClient from "./proposals-client";

export default async function EditorProposalsPage() {
  await requireRole(["editor"]);
  return (
    <Shell title="طلبات تعديل الاختصارات" backTo="/sections">
      <ProposalsClient />
    </Shell>
  );
}
