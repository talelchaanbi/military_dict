import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Shell } from "@/components/Shell";

export default async function SectionsIndexPage() {
  const sections = await prisma.section.findMany({
    orderBy: { number: "asc" },
    select: { number: true, title: true, type: true },
  });

  return (
    <Shell title="الأقسام">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => (
          <Link
            key={s.number}
            href={`/sections/${s.number}`}
            className="rounded-lg border border-zinc-200 bg-white p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          >
            <div className="text-sm text-zinc-500">قسم {s.number}</div>
            <div className="mt-1 font-semibold">{s.title}</div>
            <div className="mt-2 text-xs text-zinc-500">
              {s.type === "terms" ? "مصطلحات" : "وثائق"}
            </div>
          </Link>
        ))}
      </div>
    </Shell>
  );
}
