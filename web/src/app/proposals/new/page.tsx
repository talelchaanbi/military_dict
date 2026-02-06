import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { Shell } from "@/components/layout/Shell";
import ProposalClient from "./proposal-client";

export default async function ProposalPage({
  searchParams,
}: {
  searchParams: Promise<{ termId?: string }>;
}) {
  await requireRole(["reader"]);
  const { termId } = await searchParams;
  const id = Number.parseInt(String(termId || ""), 10);
  if (!Number.isFinite(id)) return notFound();

  const term = await prisma.term.findUnique({
    where: { id },
    select: { id: true, term: true, abbreviation: true, description: true },
  });

  if (!term) return notFound();

  return (
    <Shell title="اقتراح تعديل اختصار" backTo={`/sections`}>
      <ProposalClient term={term} />
    </Shell>
  );
}
