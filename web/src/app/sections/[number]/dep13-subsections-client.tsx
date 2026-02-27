"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { File, Search, Shield, Plane, Anchor, Rocket, Radio, Target } from "lucide-react";

export type Dep13SubsectionItem = {
  number: number;
  title: string | null;
  href: string;
  termCount: number;
  subtitleCount: number;
  sampleTerms: Array<{
    id: number;
    itemNumber: string | null;
    term: string;
  }>;
};

export function Dep13SubsectionsClient({
  items,
  originalDocHref,
}: {
  items: Dep13SubsectionItem[];
  originalDocHref?: string;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;

    return items.filter((item) => {
      const title = (item.title || "").toLowerCase();
      return (
        String(item.number).includes(q) ||
        title.includes(q) ||
        `section ${item.number}`.includes(q)
      );
    });
  }, [items, query]);

  function getSectionIcon(number: number) {
    if (number === 1301) return Shield; // Land
    if (number === 1302) return Plane;  // Air
    if (number === 1303) return Anchor; // Naval
    if (number === 1304) return Rocket; // Space
    if (number === 1305) return Radio;  // C2
    return File;
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن جزء (مثال: 1301) أو عنوان…"
            className="pl-9"
          />
        </div>

        {originalDocHref ? (
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href={originalDocHref} target="_blank" rel="noopener noreferrer">عرض الوثيقة الأصلية</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => {
          const Icon = getSectionIcon(item.number);
          
          return (
          <Card
            key={item.number}
            className="h-full hover:border-primary hover:shadow-lg transition-all"
          >
            <CardContent className="pt-6 grid gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2.5 rounded-full">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="grid gap-1">
                    <div className="font-semibold leading-tight">
                      {item.title || `قسم ${item.number}`}
                    </div>
                  </div>
                </div>
                <Button asChild size="sm" className="shrink-0">
                  <Link href={item.href}>فتح</Link>
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center rounded-full bg-muted px-2 py-1">
                  {item.termCount} مصطلح
                </span>
                {item.subtitleCount > 0 ? (
                  <span className="inline-flex items-center rounded-full bg-muted px-2 py-1">
                    {item.subtitleCount} عنوان فرعي
                  </span>
                ) : null}
              </div>

              {item.sampleTerms.length ? (
                <details className="rounded-md border bg-card/50 p-3">
                  <summary className="cursor-pointer select-none text-sm">
                    معاينة سريعة
                  </summary>
                  <ul className="mt-2 grid gap-1 text-sm">
                    {item.sampleTerms.map((t) => (
                      <li key={t.id} className="flex gap-2">
                        <span className="text-muted-foreground shrink-0">
                          {t.itemNumber || "–"}.
                        </span>
                        <Link
                          className="hover:underline"
                          href={`/sections/${item.number}?term=${t.id}`}
                        >
                          {t.term}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              ) : (
                <div className="text-sm text-muted-foreground">لا توجد معاينة متاحة.</div>
              )}
            </CardContent>
          </Card>
        );})}
      </div>

      {!filtered.length ? (
        <div className="text-sm text-muted-foreground">لا توجد نتائج مطابقة.</div>
      ) : null}
    </div>
  );
}
