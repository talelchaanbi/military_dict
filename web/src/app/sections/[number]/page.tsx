import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Shell } from "@/components/Shell";

function safeInt(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export default async function SectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ number: string }>;
  searchParams: Promise<{ q?: string; page?: string; pageSize?: string }>;
}) {
  const { number } = await params;
  const sectionNumber = safeInt(number);
  if (!sectionNumber) return notFound();

  const section = await prisma.section.findUnique({
    where: { number: sectionNumber },
    select: { id: true, number: true, title: true, type: true },
  });

  if (!section) return notFound();

  if (section.type === "document") {
    const documents = await prisma.document.findMany({
      where: { sectionId: section.id },
      orderBy: { code: "asc" },
      select: { code: true, title: true },
    });

    if (documents.length === 1) {
      redirect(`/pages/${documents[0].code}`);
    }

    return (
      <Shell title={section.title || `قسم ${section.number}`}>
        <div className="grid gap-3 sm:grid-cols-2">
          {documents.map((d) => (
            <Link
              key={d.code}
              href={`/pages/${d.code}`}
              className="rounded-lg border border-zinc-200 bg-white p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            >
              <div className="font-semibold">{d.title || d.code}</div>
            </Link>
          ))}
        </div>
      </Shell>
    );
  }

  const { q = "", page = "1", pageSize = "25" } = await searchParams;
  const query = String(q || "").trim();
  const pageNum = Math.max(1, Number.parseInt(page, 10) || 1);
  const sizeNum = Math.max(1, Math.min(200, Number.parseInt(pageSize, 10) || 25));

  const where = {
    sectionId: section.id,
    ...(query
      ? {
          OR: [
            { term: { contains: query } },
            { description: { contains: query } },
            { abbreviation: { contains: query } },
          ],
        }
      : {}),
  };

  const [total, terms] = await Promise.all([
    prisma.term.count({ where }),
    prisma.term.findMany({
      where,
      orderBy: { id: "asc" },
      skip: (pageNum - 1) * sizeNum,
      take: sizeNum,
      select: {
        id: true,
        itemNumber: true,
        term: true,
        description: true,
        abbreviation: true,
      },
    }),
  ]);

  return (
    <Shell title={section.title || `قسم ${section.number}`}>
      <form className="mb-4 flex gap-2" action="" method="get">
        <input
          name="q"
          defaultValue={query}
          placeholder="بحث..."
          className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900"
        />
        <button className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white">
          بحث
        </button>
      </form>

      <div className="mb-3 text-sm text-zinc-500">المجموع: {total}</div>

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid grid-cols-12 gap-0 border-b border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
          <div className="col-span-2">رقم</div>
          <div className="col-span-4">المصطلح</div>
          <div className="col-span-5">الشرح</div>
          <div className="col-span-1">اختصار</div>
        </div>
        {terms.map((t) => (
          <div
            key={t.id}
            className="grid grid-cols-12 gap-0 border-b border-zinc-100 px-3 py-3 text-sm last:border-b-0 dark:border-zinc-800"
          >
            <div className="col-span-2 text-zinc-500">{t.itemNumber || ""}</div>
            <div className="col-span-4 font-semibold">{t.term}</div>
            <div className="col-span-5 text-zinc-700 dark:text-zinc-200">
              {t.description || ""}
            </div>
            <div className="col-span-1 text-zinc-500">{t.abbreviation || ""}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="text-zinc-500">
          صفحة {pageNum} / {Math.max(1, Math.ceil(total / sizeNum))}
        </div>
        <div className="flex gap-2">
          {pageNum > 1 ? (
            <Link
              className="rounded-md border border-zinc-200 bg-white px-3 py-1 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
              href={`/sections/${section.number}?q=${encodeURIComponent(query)}&page=${pageNum - 1}&pageSize=${sizeNum}`}
            >
              السابق
            </Link>
          ) : null}
          {pageNum * sizeNum < total ? (
            <Link
              className="rounded-md border border-zinc-200 bg-white px-3 py-1 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
              href={`/sections/${section.number}?q=${encodeURIComponent(query)}&page=${pageNum + 1}&pageSize=${sizeNum}`}
            >
              التالي
            </Link>
          ) : null}
        </div>
      </div>
    </Shell>
  );
}
