import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Shell } from "@/components/layout/Shell";
import { Prisma } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, ChevronLeft, ChevronRight, File, ArrowRight, Ban } from "lucide-react";
import { ImageZoom } from "@/components/ui/image-zoom";
import { HashAnchorOffset } from "@/components/ui/hash-anchor-offset";
import {
  Dep13SubsectionsClient,
  type Dep13SubsectionItem,
} from "./dep13-subsections-client";
import {
  QuickTermIndexClient,
  type QuickTerm,
} from "./quick-term-index-client";

function safeInt(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

type TermRow = {
  id: number;
  itemNumber: string | null;
  term: string;
  description: string | null;
  abbreviation: string | null;
  imageUrl: string | null;
  subtitleId: number | null;
};

type TermGroup = {
  id: string;
  title: string;
  parentTitle?: string;
  subTitle?: string;
  subtitleId: number;
  terms: TermRow[];
};

type ColumnDef = {
  key: string;
  label: string;
  className: string;
};

// ... removed cleanText ...
// ... removed loadSubtitleGroups ...

export default async function SectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ number: string }>;
  searchParams: Promise<{
    q?: string;
    page?: string;
    pageSize?: string;
    field?: string;
    hasAbbr?: string;
    hasDesc?: string;
    starts?: string;
    sort?: string;
    term?: string; // Add term ID for highlighting
  }>;
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
    // Special handling for Department 13 which has been migrated to dynamic sections 1301-1305
    if (section.number === 13) {
      const subSections = await prisma.section.findMany({
        where: {
          number: {
            in: [1301, 1302, 1303, 1304, 1305]
          }
        },
        orderBy: { number: "asc" }
      });

      const items: Dep13SubsectionItem[] = await Promise.all(
        subSections.map(async (sub) => {
          const [termCount, subtitleCount, sampleTerms] = await Promise.all([
            prisma.term.count({
              where: {
                sectionId: sub.id,
                term: { not: "#" },
              },
            }),
            prisma.subtitle.count({
              where: { sectionId: sub.id },
            }),
            prisma.term.findMany({
              where: {
                sectionId: sub.id,
                term: { not: "#" },
              },
              orderBy: [{ itemNumber: "asc" }, { id: "asc" }],
              take: 5,
              select: {
                id: true,
                itemNumber: true,
                term: true,
              },
            }),
          ]);

          return {
            number: sub.number,
            title: sub.title,
            href: `/sections/${sub.number}`,
            termCount,
            subtitleCount,
            sampleTerms,
          };
        })
      );

      return (
        <Shell title={section.title || `قسم ${section.number}`} backTo="/sections" fullWidth>
          <Dep13SubsectionsClient items={items} originalDocHref="/viewer/dep13" />
        </Shell>
      );
    }

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
  const {
    q = "",
    page = "1",
    pageSize = "25",
    field = "all",
    hasAbbr = "0",
    hasDesc = "0",
    starts = "",
    sort = "number-asc",
    term: initialTermId = "",
  } = await searchParams;

  const query = String(q || "").trim();
  const pageNum = Math.max(1, Number.parseInt(page, 10) || 1);
  const sizeNum = Math.max(1, Math.min(200, Number.parseInt(pageSize, 10) || 25));
  const searchField = ["all", "term", "description", "abbreviation", "itemNumber"].includes(String(field))
    ? String(field)
    : "all";
  const wantsAbbr = hasAbbr === "1";
  const wantsDesc = hasDesc === "1";
  const startsWith = String(starts || "").trim();
  const sortBy = ["number-asc", "number-desc", "term-asc", "term-desc"].includes(String(sort))
    ? String(sort)
    : "number-asc";
  const highlightTermId = safeInt(initialTermId);

  const hasFilters = Boolean(
    query || wantsAbbr || wantsDesc || startsWith || searchField !== "all" || sortBy !== "number-asc"
  );

  const isGroupedView = section.number >= 1 && section.number <= 11;

  // Retrieve subtitles from DB if applicable
  const dbSubtitles = isGroupedView
    ? await prisma.subtitle.findMany({
        where: { sectionId: section.id },
        orderBy: { order: "asc" },
        include: { parent: true },
      })
    : [];

  const canGroup = isGroupedView && dbSubtitles.length > 0;

  const shouldShowQuickIndex = section.number >= 1 && section.number <= 11;
  let quickTerms: QuickTerm[] = [];
  if (shouldShowQuickIndex) {
    quickTerms = await prisma.term.findMany({
      where: {
        sectionId: section.id,
        term: { not: "#" },
        abbreviation: { not: null },
        NOT: { abbreviation: "" },
      },
      orderBy: [{ itemNumber: "asc" }, { id: "asc" }],
      take: 14,
      select: { id: true, itemNumber: true, term: true },
    });

    if (quickTerms.length < 10) {
      const fallback = await prisma.term.findMany({
        where: {
          sectionId: section.id,
          term: { not: "#" },
        },
        orderBy: [{ itemNumber: "asc" }, { id: "asc" }],
        take: 14,
        select: { id: true, itemNumber: true, term: true },
      });

      const seen = new Set(quickTerms.map((t) => t.id));
      for (const t of fallback) {
        if (!seen.has(t.id)) quickTerms.push(t);
        if (quickTerms.length >= 14) break;
      }
    }
  }

  const andFilters: Array<Record<string, unknown>> = [{ sectionId: section.id }];

  if (query) {
    if (searchField === "term") {
      andFilters.push({ term: { contains: query } });
    } else if (searchField === "description") {
      andFilters.push({ description: { contains: query } });
    } else if (searchField === "abbreviation") {
      andFilters.push({ abbreviation: { contains: query } });
    } else if (searchField === "itemNumber") {
      andFilters.push({ itemNumber: { contains: query } });
    } else {
      andFilters.push({
        OR: [
          { term: { contains: query } },
          { description: { contains: query } },
          { abbreviation: { contains: query } },
          { itemNumber: { contains: query } },
        ],
      });
    }
  }

  if (startsWith) {
    if (searchField === "description") {
      andFilters.push({ description: { startsWith } });
    } else if (searchField === "abbreviation") {
      andFilters.push({ abbreviation: { startsWith } });
    } else if (searchField === "itemNumber") {
      andFilters.push({ itemNumber: { startsWith } });
    } else {
      andFilters.push({ term: { startsWith } });
    }
  }

  if (wantsAbbr) {
    andFilters.push({ abbreviation: { not: null } });
    andFilters.push({ abbreviation: { not: "" } });
  }

  if (wantsDesc) {
    andFilters.push({ description: { not: null } });
    andFilters.push({ description: { not: "" } });
  }

  if (section.number >= 1301 && section.number <= 1399) {
    andFilters.push({ term: { not: "#" } });
  }

  const where = { AND: andFilters };

  const orderBy: Prisma.TermOrderByWithRelationInput[] =
    sortBy === "term-asc"
      ? [{ term: "asc" }, { id: "asc" }]
      : sortBy === "term-desc"
        ? [{ term: "desc" }, { id: "desc" }]
        : sortBy === "number-desc"
          ? [{ itemNumber: "desc" }, { id: "desc" }]
          : [{ itemNumber: "asc" }, { id: "asc" }];

  // Determine redirect URL logic for pagination
  if (highlightTermId && !canGroup) {
      const allIds = await prisma.term.findMany({
            where,
            orderBy,
            select: { id: true }
      });
        
      const index = allIds.findIndex(t => t.id === highlightTermId);
      if (index !== -1) {
          const targetPage = Math.floor(index / sizeNum) + 1;
          
          if (targetPage !== pageNum) {
                const params = new URLSearchParams();
                if (query) params.set("q", query);
                if (searchField !== "all") params.set("field", searchField);
                if (wantsAbbr) params.set("hasAbbr", "1");
                if (wantsDesc) params.set("hasDesc", "1");
                if (startsWith) params.set("starts", startsWith);
                if (sortBy !== "number-asc") params.set("sort", sortBy);
                if (String(sizeNum) !== "25") params.set("pageSize", String(sizeNum));
                
                params.set("page", String(targetPage));
                params.set("term", String(highlightTermId));
                
                redirect(`/sections/${section.number}?${params.toString()}#term-${highlightTermId}`);
            }
      }
  }

  const skip = (pageNum - 1) * sizeNum;

  const [total, terms] = canGroup
    ? await Promise.all([
        prisma.term.count({ where }),
        prisma.term.findMany({
          where,
          orderBy: { id: "asc" },
          select: {
            id: true,
            itemNumber: true,
            term: true,
            description: true,
            abbreviation: true,
            imageUrl: true,
            subtitleId: true,
          },
        }),
      ])
    : await Promise.all([
        prisma.term.count({ where }),
        prisma.term.findMany({
          where,
          orderBy,
          skip,
          take: sizeNum,
          select: {
            id: true,
            itemNumber: true,
            term: true,
            description: true,
            abbreviation: true,
            imageUrl: true,
            subtitleId: true,
          },
        }),
      ]);

  const totalPages = Math.max(1, Math.ceil(total / sizeNum));

    let groupedTerms: TermGroup[] = [];
  
  if (canGroup) {
      const subtitleMap = new Map<number, TermGroup>();
      const rawGroups: TermGroup[] = [];

      // Initialize groups from DB Subtitles
      for (const sub of dbSubtitles) {
          const groupObj: TermGroup = {
              id: `subtitle-${sub.id}`,
              title: sub.title,
              parentTitle: sub.parent ? sub.parent.title : undefined,
              subTitle: sub.parent ? sub.title : undefined,
              subtitleId: sub.id,
            terms: [],
          };
          subtitleMap.set(sub.id, groupObj);
          rawGroups.push(groupObj);
      }

        const ungrouped: TermRow[] = [];

      (terms as TermRow[]).forEach((term) => {
        if (term.subtitleId && subtitleMap.has(term.subtitleId)) {
          subtitleMap.get(term.subtitleId)!.terms.push(term);
        } else {
          ungrouped.push(term);
        }
      });

      // Filter groups that have terms
      groupedTerms = rawGroups.filter(g => g.terms.length > 0);

      // Add "Other" if needed
      if (ungrouped.length > 0) {
        groupedTerms.push({
          id: `subtitle-${section.number}-other`,
          title: "مصطلحات أخرى",
          subtitleId: -1,
          terms: ungrouped,
        });
      }
  }

  const navItems = canGroup
    ? (() => {
        const items: Array<{ id: string; title: string; children?: Array<{ id: string; title: string }> }> = [];
        const parentIndex = new Map<string, number>();

        groupedTerms.forEach((group) => {
          const parentTitle = group.parentTitle || group.title;
          if (group.subTitle) {
            if (!parentIndex.has(parentTitle)) {
              items.push({ id: group.id, title: parentTitle, children: [] });
              parentIndex.set(parentTitle, items.length - 1);
            }
            items[parentIndex.get(parentTitle)!].children!.push({
              id: group.id,
              title: group.subTitle,
            });
          } else {
            items.push({ id: group.id, title: group.title });
          }
        });

        return items;
      })()
    : [];

  const currentUser = await getCurrentUser();
  const canPropose = currentUser?.role === "reader";
  const descriptionCol = canPropose ? "col-span-6 sm:col-span-6" : "col-span-6 sm:col-span-7";

  const isDep13SubSection = section.number >= 1301 && section.number <= 1399;

  const baseParams = new URLSearchParams();
  if (query) baseParams.set("q", query);
  if (searchField !== "all") baseParams.set("field", searchField);
  if (wantsAbbr) baseParams.set("hasAbbr", "1");
  if (wantsDesc) baseParams.set("hasDesc", "1");
  if (startsWith) baseParams.set("starts", startsWith);
  if (sortBy !== "number-asc") baseParams.set("sort", sortBy);
  if (sizeNum !== 25) baseParams.set("pageSize", String(sizeNum));

  const buildFilterLink = (mutations: Record<string, string | null>) => {
    const params = new URLSearchParams(baseParams);
    for (const [key, value] of Object.entries(mutations)) {
      if (!value) params.delete(key);
      else params.set(key, value);
    }
    const qs = params.toString();
    return qs ? `/sections/${section.number}?${qs}` : `/sections/${section.number}`;
  };

  const fieldLabel: Record<string, string> = {
    all: "بحث في الكل",
    term: isDep13SubSection ? "معنى الرمز" : "المصطلح",
    description: isDep13SubSection ? "الملاحظات" : "الشرح",
    abbreviation: "الاختصار",
    itemNumber: "الرقم",
  };

  const sortLabel: Record<string, string> = {
    "number-asc": "الرقم ↑",
    "number-desc": "الرقم ↓",
    "term-asc": "المصطلح أ-ي",
    "term-desc": "المصطلح ي-أ",
  };

  const activeChips: Array<{ label: string; href: string }> = [];
  if (query) activeChips.push({ label: `بحث: ${query}`, href: buildFilterLink({ q: null }) });
  if (searchField !== "all") {
    activeChips.push({ label: `نطاق: ${fieldLabel[searchField] || searchField}`, href: buildFilterLink({ field: null }) });
  }
  if (startsWith) {
    activeChips.push({ label: `يبدأ بـ: ${startsWith}`, href: buildFilterLink({ starts: null }) });
  }
  if (!isDep13SubSection && wantsAbbr) {
    activeChips.push({ label: "اختصار فقط", href: buildFilterLink({ hasAbbr: null }) });
  }
  if (wantsDesc) {
    activeChips.push({ label: "شرح فقط", href: buildFilterLink({ hasDesc: null }) });
  }
  if (sortBy !== "number-asc") {
    activeChips.push({ label: `ترتيب: ${sortLabel[sortBy] || sortBy}`, href: buildFilterLink({ sort: null }) });
  }
  if (sizeNum !== 25) {
    activeChips.push({ label: `حجم: ${sizeNum}`, href: buildFilterLink({ pageSize: null }) });
  }

  const buildPageLink = (targetPage: number) => {
    const params = new URLSearchParams(baseParams);
    params.set("page", String(targetPage));
    return `/sections/${section.number}?${params.toString()}`;
  };


const columns: ColumnDef[] = isDep13SubSection
    ? [
        { key: 'id', label: 'الرقم', className: 'col-span-2 sm:col-span-1 text-center' },
        { key: 'imageUrl', label: 'الرمز', className: 'col-span-4 sm:col-span-3 text-center' },
        { key: 'term', label: 'معنى الرمز', className: 'col-span-4 sm:col-span-4 text-center' },
        { key: 'description', label: 'ملاحظات', className: `${canPropose ? 'col-span-2 sm:col-span-3' : 'col-span-2 sm:col-span-4'} text-center` },
        ...(canPropose ? [{ key: 'actions', label: 'اقتراح', className: 'hidden sm:block sm:col-span-1 text-center' }] : [])
      ]
    : [
        { key: 'itemNumber', label: 'الرقم', className: 'col-span-2 sm:col-span-1' },
        { key: 'term', label: 'المصطلح', className: 'col-span-4 sm:col-span-3' },
        { key: 'description', label: 'الشرح / المفهوم', className: `${descriptionCol}` },
        { key: 'abbreviation', label: 'اختصار', className: 'hidden sm:block sm:col-span-1' },
        ...(canPropose ? [{ key: 'actions', label: 'اقتراح', className: 'hidden sm:block sm:col-span-1' }] : [])
      ];

// Helper to render row content based on configuration
const renderRow = (t: TermRow) => {
    if (isDep13SubSection) {
        return (
            <>
                <div className="col-span-2 sm:col-span-1 font-mono text-muted-foreground text-xs pt-1 flex items-center justify-center">{t.id}</div>
                
                {/* Symbol Col (formerly imageUrl) - CENTERED */}
                <div className="col-span-4 sm:col-span-3 flex justify-center items-center">
                     {t.imageUrl ? (
                        <div className="inline-block bg-white border rounded-md overflow-hidden">
                          <ImageZoom src={t.imageUrl} alt={t.term} className="w-full max-w-[200px] h-auto block object-contain" cropBorder={true} />
                        </div>
                     ) : (
                        <span className="text-muted-foreground text-xs italic">لا يوجد رمز</span>
                     )}
                </div>

                {/* Meaning Col (formerly term) - CENTERED */}
                <div className="col-span-4 sm:col-span-4 font-bold text-primary text-base leading-snug flex items-center justify-center text-center">
                    {t.term}
                </div>

                {/* Notes Col (formerly description) */}
                <div className={`${canPropose ? 'col-span-2 sm:col-span-3' : 'col-span-2 sm:col-span-4'} text-foreground/90 leading-relaxed text-base flex items-center justify-center text-center`}>
                    {t.description || ""}
                </div>

                {canPropose && (
                    <div className="hidden sm:flex sm:col-span-1 items-center justify-center">
                          <Link
                            href={`/proposals/new?termId=${t.id}`}
                            className="text-xs text-primary hover:underline"
                          >
                            اقتراح
                          </Link>
                    </div>
                )}
            </>
        )
    }

    return (
        <>
            <div className="col-span-2 sm:col-span-1 font-mono text-muted-foreground text-xs pt-1">{t.itemNumber || "-"}</div>
            <div className="col-span-4 sm:col-span-3 font-bold text-primary text-base leading-snug">{t.term}</div>
            <div className={`${descriptionCol} text-foreground/90 leading-relaxed text-base`}>
                {t.imageUrl && (
                <div className="inline-block bg-white p-1 rounded-md border mb-2 overflow-hidden">
                    <ImageZoom src={t.imageUrl} alt={t.term} className="w-full max-w-[150px] h-auto max-h-[150px] object-contain" cropBorder={true} />
                </div>
                )}
                {t.description || (!t.imageUrl && <span className="text-muted-foreground italic">لا يوجد شرح</span>)}
            </div>
            <div className="hidden sm:flex sm:col-span-1 items-center">
                {t.abbreviation ? (
                  <span className="inline-block font-mono font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-md text-sm shadow-sm transform hover:scale-105 transition-transform cursor-default select-all" title="اختصار">
                    {t.abbreviation}
                  </span>
                ) : (
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted/30 border border-muted" title="لا يوجد اختصار">
                    <Ban className="w-4 h-4 text-muted-foreground/40" />
                  </div>
                )}
            </div>
            {canPropose && (
                <div className="hidden sm:block sm:col-span-1">
                    <Link
                    href={`/proposals/new?termId=${t.id}`}
                    className="text-xs text-primary hover:underline"
                    >
                    اقتراح
                    </Link>
                </div>
            )}
        </>
    );
}
  
  return (
    <Shell title={section.title || `قسم ${section.number}`} backTo={section.number >= 1300 ? "/sections/13" : "/sections"} fullWidth>
      <HashAnchorOffset anchorId={highlightTermId ? `term-${highlightTermId}` : null} />

      {shouldShowQuickIndex ? (
        <QuickTermIndexClient sectionNumber={section.number} quickTerms={quickTerms} />
      ) : null}

      {hasFilters ? (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">فلاتر نشطة:</span>
          {activeChips.map((chip) => (
            <Link
              key={chip.label}
              href={chip.href}
              className="rounded-full border bg-muted px-3 py-1 text-xs font-semibold text-foreground hover:bg-accent"
              title="إزالة هذا الفلتر"
            >
              {chip.label}
            </Link>
          ))}
          <Link
            href={`/sections/${section.number}`}
            className="rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground hover:text-primary"
            title="إزالة كل الفلاتر"
          >
            إعادة ضبط الكل
          </Link>
        </div>
      ) : null}
      
      {/* Search Bar */}
      <div className="mb-8">
        <form className="grid gap-4" action="" method="get">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                name="q"
                defaultValue={query}
                placeholder="ابحث عن مصطلح، تعريف، أو اختصار..."
                className="pr-10 h-10 sm:h-11 text-sm sm:text-base shadow-sm"
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              <Button size="lg" className="px-8 font-semibold w-full sm:w-auto">بحث</Button>
              <Link
                href={`/sections/${section.number}`}
                className="text-sm text-muted-foreground hover:text-primary text-center sm:text-right"
              >
                إعادة ضبط
              </Link>
            </div>
          </div>

          <details className="rounded-lg border bg-card/60 p-4">
            <summary className="cursor-pointer select-none text-sm font-semibold">
              تصفية متقدمة
              {hasFilters ? <span className="text-xs font-normal text-muted-foreground"> (مفعّلة)</span> : null}
            </summary>

            <div className="mt-4 grid gap-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="grid gap-1">
                  <label className="text-xs text-muted-foreground">نطاق البحث</label>
                  <select
                    aria-label="نطاق البحث"
                    name="field"
                    defaultValue={searchField}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="all">بحث في الكل</option>
                    <option value="term">{isDep13SubSection ? "معنى الرمز" : "المصطلح فقط"}</option>
                    <option value="description">{isDep13SubSection ? "الملاحظات" : "الشرح فقط"}</option>
                    {!isDep13SubSection && <option value="abbreviation">الاختصار فقط</option>}
                    <option value="itemNumber">الرقم فقط</option>
                  </select>
                </div>

                <div className="grid gap-1">
                  <label className="text-xs text-muted-foreground">يبدأ بـ</label>
                  <Input
                    name="starts"
                    defaultValue={startsWith}
                    placeholder="مثال: أ، ب، ..."
                    className="h-10"
                  />
                </div>

                <div className="grid gap-1">
                  <label className="text-xs text-muted-foreground">الترتيب</label>
                  <select
                    aria-label="ترتيب النتائج"
                    name="sort"
                    defaultValue={sortBy}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="number-asc">ترتيب: الرقم ↑</option>
                    <option value="number-desc">ترتيب: الرقم ↓</option>
                    <option value="term-asc">ترتيب: المصطلح أ-ي</option>
                    <option value="term-desc">ترتيب: المصطلح ي-أ</option>
                  </select>
                </div>

                <div className="grid gap-1">
                  <label className="text-xs text-muted-foreground">حجم الصفحة</label>
                  <select
                    aria-label="حجم الصفحة"
                    name="pageSize"
                    defaultValue={String(sizeNum)}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                    <option value="200">200</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                {!isDep13SubSection ? (
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="hasAbbr" value="1" defaultChecked={wantsAbbr} />
                    يحتوي اختصار فقط
                  </label>
                ) : null}

                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="hasDesc" value="1" defaultChecked={wantsDesc} />
                  يحتوي شرح فقط
                </label>
              </div>
            </div>
          </details>
        </form>
      </div>

      <div className="mb-4 text-sm text-muted-foreground flex justify-between items-center">
         <span>عدد النتائج: <span className="font-semibold text-foreground">{total}</span></span>
        {!canGroup && <span>صفحة {pageNum} من {totalPages}</span>}
      </div>

      {/* Results Table/List */}
      {canGroup ? (
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-64 xl:w-72 shrink-0">
            <div className="rounded-xl border bg-card/90 text-card-foreground backdrop-blur p-4 lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] overflow-y-auto">
              <div className="text-sm font-semibold text-muted-foreground mb-3">
                العناوين الفرعية
              </div>
              <div className="flex flex-col gap-3">
                {navItems.map((item) => (
                  <div key={item.id} className="flex flex-col gap-2">
                    <a
                      href={`#${item.id}`}
                      className="rounded-full border bg-muted px-3 py-1 text-xs font-semibold text-foreground hover:bg-accent w-fit"
                    >
                      {item.title}
                    </a>
                    {item.children && item.children.length > 0 && (
                      <div className="flex flex-wrap gap-2 pl-3">
                        {item.children.map((child) => (
                          <a
                            key={child.id}
                            href={`#${child.id}`}
                            className="rounded-full border bg-muted/70 px-3 py-1 text-xs text-foreground hover:bg-accent"
                          >
                            {child.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <div className="flex-1 space-y-6">
            {groupedTerms.map((group, idx) => (
              <div key={group.id} id={group.id} className="group-section scroll-mt-24 rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-muted/40">
                  {group.subTitle && group.parentTitle ? (
                    <div className="space-y-1">
                      {(idx === 0 || groupedTerms[idx - 1]?.parentTitle !== group.parentTitle) && (
                        <div className="text-xs font-semibold text-muted-foreground">{group.parentTitle}</div>
                      )}
                      <div className="text-sm font-semibold">{group.title}</div>
                    </div>
                  ) : (
                    <div className="text-sm font-semibold">{group.title}</div>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <div className="min-w-[720px] grid grid-cols-12 gap-2 sm:gap-4 border-b bg-muted/50 px-3 sm:px-4 py-3 text-[11px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        {columns.map((col) => (
                          <div key={col.key} className={col.className}>{col.label}</div>
                      ))}
                  </div>

                  {group.terms.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground">
                      لا توجد عناصر ضمن هذا العنوان.
                    </div>
                  ) : (
                    <div className="min-w-[720px] divide-y divide-border">
                      {group.terms.map((t: TermRow) => (
                        <div
                          key={t.id}
                          id={`term-${t.id}`}
                          className={`scroll-mt-40 grid grid-cols-12 gap-2 sm:gap-4 px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm hover:bg-muted/30 transition-colors items-start ${
                            highlightTermId === t.id ? "bg-primary/10 dark:bg-primary/20 border-l-4 border-primary ring-2 ring-primary/30" : ""
                          }`}
                        >
                          {renderRow(t)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {/* Table Header */}
              <div className="min-w-[720px] grid grid-cols-12 gap-2 sm:gap-4 border-b bg-muted/50 px-3 sm:px-4 py-3 text-[11px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {columns.map((col) => (
                      <div key={col.key} className={col.className}>{col.label}</div>
                 ))}
            </div>
            
            {/* Table Body */}
            {terms.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                    لا توجد نتائج مطابقة للبحث.
                </div>
            ) : (
                <div className="min-w-[720px] divide-y divide-border">
                    {terms.map((t: TermRow) => (
                    <div
                        key={t.id}
                        id={`term-${t.id}`}
                        className={`scroll-mt-40 grid grid-cols-12 gap-2 sm:gap-4 px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm hover:bg-muted/30 transition-colors items-start ${
                          highlightTermId === t.id ? "bg-primary/10 dark:bg-primary/20 border-l-4 border-primary ring-2 ring-primary/30" : ""
                        }`}
                    >
                       {renderRow(t)}
                    </div>
                    ))}
                </div>
            )}
          </div>
        </div>
      )}

      {/* Pagination */}
      {!canGroup && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            aria-disabled={pageNum <= 1}
            tabIndex={pageNum <= 1 ? -1 : undefined}
            className={pageNum <= 1 ? "pointer-events-none opacity-50" : ""}
            href={buildPageLink(pageNum - 1)}
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
            href={buildPageLink(pageNum + 1)}
          >
            <Button variant="outline" size="sm" disabled={pageNum >= totalPages} className="gap-2">
              التالي <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}
    </Shell>
  );
}
