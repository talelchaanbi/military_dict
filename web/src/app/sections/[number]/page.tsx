import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Shell } from "@/components/layout/Shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Search, ChevronLeft, ChevronRight, File, ArrowRight } from "lucide-react";

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

  // Handle Document Sections (12 & 13)
  if (section.type === "document") {
    const documents = await prisma.document.findMany({
      where: { sectionId: section.id },
      orderBy: { code: "asc" },
      select: { code: true, title: true },
    });

    if (documents.length === 1) {
       // Direct link to the viewer page
       redirect(`/viewer/${documents[0].code}`);
    }

    return (
      <Shell title={section.title || `قسم ${section.number}`} backTo="/sections" fullWidth>
        <div className="grid gap-6">
          {documents.map((d) => (
            <Link
              key={d.code}
              href={`/viewer/${d.code}`}
              className="block group"
            >
              <Card className="h-full hover:border-primary hover:shadow-lg transition-all">
                 <CardContent className="pt-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-3 rounded-full group-hover:bg-primary/20 transition-colors">
                            <File className="h-6 w-6 text-primary" />
                        </div>
                        <div className="font-semibold text-lg">{d.title || d.code}</div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                 </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </Shell>
    );
  }

  // Handle Terms Sections (1-11)
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

  const totalPages = Math.max(1, Math.ceil(total / sizeNum));

  return (
    <Shell title={section.title || `قسم ${section.number}`} backTo="/sections">
      
      {/* Search Bar */}
      <div className="mb-8">
        <form className="flex gap-4 max-w-2xl" action="" method="get">
            <div className="relative flex-1">
                <Search className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                name="q"
                defaultValue={query}
                placeholder="ابحث عن مصطلح، تعريف، أو اختصار..."
                className="pr-10 h-11 text-base shadow-sm"
                />
            </div>
            <Button size="lg" className="px-8 font-semibold">بحث</Button>
        </form>
      </div>

      <div className="mb-4 text-sm text-muted-foreground flex justify-between items-center">
         <span>عدد النتائج: <span className="font-semibold text-foreground">{total}</span></span>
         <span>صفحة {pageNum} من {totalPages}</span>
      </div>

      {/* Results Table/List */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-0 border-b bg-muted/50 px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
          <div className="col-span-2 sm:col-span-1">الرقم</div>
          <div className="col-span-4 sm:col-span-3">المصطلح</div>
          <div className="col-span-6 sm:col-span-7">الشرح / المفهوم</div>
          <div className="hidden sm:block sm:col-span-1">اختصار</div>
        </div>
        
        {/* Table Body */}
        {terms.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
                لا توجد نتائج مطابقة للبحث.
            </div>
        ) : (
            <div className="divide-y divide-border">
                {terms.map((t) => (
                <div
                    key={t.id}
                    className="grid grid-cols-12 gap-4 px-4 py-4 text-sm hover:bg-muted/30 transition-colors items-start"
                >
                    <div className="col-span-2 sm:col-span-1 font-mono text-muted-foreground text-xs pt-1">{t.itemNumber || "-"}</div>
                    <div className="col-span-4 sm:col-span-3 font-bold text-primary text-base leading-snug">{t.term}</div>
                    <div className="col-span-6 sm:col-span-7 text-foreground/90 leading-relaxed text-base">
                        {t.description || <span className="text-muted-foreground italic">لا يوجد شرح</span>}
                    </div>
                    <div className="hidden sm:block sm:col-span-1 text-muted-foreground font-mono bg-muted/50 w-fit px-2 py-0.5 rounded text-xs">{t.abbreviation || ""}</div>
                </div>
                ))}
            </div>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            aria-disabled={pageNum <= 1}
            tabIndex={pageNum <= 1 ? -1 : undefined}
            className={pageNum <= 1 ? "pointer-events-none opacity-50" : ""}
            href={`/sections/${section.number}?q=${encodeURIComponent(query)}&page=${pageNum - 1}&pageSize=${sizeNum}`}
          >
             <Button variant="outline" size="sm" disabled={pageNum <= 1} className="gap-2">
                <ChevronRight className="h-4 w-4" /> السابق
             </Button>
          </Link>
          
          <div className="text-sm font-medium">
             {pageNum} / {totalPages}
          </div>

          <Link
            aria-disabled={pageNum >= totalPages}
            tabIndex={pageNum >= totalPages ? -1 : undefined}
            className={pageNum >= totalPages ? "pointer-events-none opacity-50" : ""}
            href={`/sections/${section.number}?q=${encodeURIComponent(query)}&page=${pageNum + 1}&pageSize=${sizeNum}`}
          >
             <Button variant="outline" size="sm" disabled={pageNum >= totalPages} className="gap-2">
                التالي <ChevronLeft className="h-4 w-4" />
             </Button>
          </Link>
      </div>
    </Shell>
  );
}
