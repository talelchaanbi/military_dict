"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  File, Search, Shield, Plane, Anchor, Rocket, Radio, Target, 
  ChevronDown, BookOpen, Layers
} from "lucide-react";

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
        `section ${item.number}`.includes(q) ||
        `قسم ${item.number}`.includes(q)
      );
    });
  }, [items, query]);

  function getSectionIcon(number: number) {
    if (number === 1301) return Shield;
    if (number === 1302) return Plane;
    if (number === 1303) return Anchor;
    if (number === 1304) return Rocket;
    if (number === 1305) return Radio;
    return File;
  }

  return (
    <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative w-full sm:max-w-md group">
          <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن قسم (مثال: 1301) أو عنوان..."
            className="pr-10 h-11 text-base bg-muted/50 border-transparent focus:bg-background focus:border-border transition-all duration-300 shadow-none focus-visible:ring-1 focus-visible:ring-primary/50"
          />
        </div>

        {originalDocHref && (
          <Button asChild variant="outline" className="w-full sm:w-auto h-11 gap-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300">
            <Link href={originalDocHref} target="_blank" rel="noopener noreferrer">
              <BookOpen className="h-4 w-4" />
              عرض الوثيقة الأصلية
            </Link>
          </Button>
        )}
      </div>

      {!filtered.length ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-card rounded-xl border border-dashed">
          <div className="bg-muted p-4 rounded-full mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">لا توجد نتائج مطابقة</h3>
          <p className="text-sm text-muted-foreground">جرب كلمات مفتاحية مختلفة أو تأكد من رقم القسم.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 items-start">
          {filtered.map((item, index) => {
            const Icon = getSectionIcon(item.number);
            
            return (
            <Card
              key={item.number}
              className="group relative flex flex-col overflow-hidden bg-gradient-to-br from-card to-card/50 hover:border-primary/40 hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Decorative background shape */}
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/25 transition-colors duration-500 pointer-events-none" />
              
              {/* Background Logo Watermark */}
              <div className="absolute -left-6 -bottom-6 text-primary/20 group-hover:text-primary/40 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-700 pointer-events-none z-0">
                <Icon className="w-56 h-56" strokeWidth={1.5} />
              </div>

              <CardContent className="pt-6 px-5 pb-5 grid gap-5 flex-1 z-10 relative">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/15 p-3 rounded-2xl group-hover:bg-primary/30 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 shadow-sm">
                      <Icon className="h-6 w-6 text-primary" strokeWidth={2} />
                    </div>
                    <div className="grid gap-1.5 mt-1">
                      <div className="text-[0.85rem] uppercase tracking-wider font-bold text-primary/90">
                        القسم {item.number}
                      </div>
                      <div className="font-bold text-lg leading-snug group-hover:text-primary transition-colors">
                        {item.title || "بدون عنوان"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/80 text-secondary-foreground border border-secondary/30 px-3 py-1.5 shadow-sm">
                    <Layers className="h-3.5 w-3.5" />
                    {item.termCount} مصطلح
                  </span>
                  {item.subtitleCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/90 text-foreground border border-border/80 px-3 py-1.5 shadow-sm">
                      <Target className="h-3.5 w-3.5" />
                      {item.subtitleCount} مجموعة
                    </span>
                  )}
                </div>

                <div className="mt-auto pt-2 flex flex-col gap-3">
                  {item.sampleTerms.length ? (
                    <div className="rounded-xl border border-primary/15 bg-background/90 backdrop-blur-sm p-3 shadow-sm group-hover:border-primary/30 transition-colors duration-300 relative z-10">
                      <h4 className="text-[11px] font-bold text-primary/90 uppercase opacity-90 mb-2.5 px-1">
                        وصول سريع
                      </h4>
                      <ul className="grid gap-2 text-sm">
                        {item.sampleTerms.map((t) => (
                          <li key={t.id} className="flex gap-2.5 items-baseline group/link">
                            <span className="text-muted-foreground/60 font-mono text-[10px] w-5 text-right shrink-0">
                              {t.itemNumber || "–"}
                            </span>
                            <Link
                              className="font-medium text-foreground/80 hover:text-primary transition-colors duration-200 line-clamp-1"
                              href={`/sections/${item.number}?term=${t.id}`}
                              title={t.term}
                            >
                              {t.term}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="text-sm text-foreground/70 bg-muted/50 backdrop-blur-sm rounded-xl px-4 py-3 border border-border/50 text-center relative z-10">
                      لا توجد مصطلحات للعرض
                    </div>
                  )}
                  
                  <Button asChild className="w-full group/btn relative overflow-hidden">
                    <Link href={item.href}>
                      <span className="relative z-10 transition-transform duration-300 group-hover/btn:scale-105">تصفح القسم بالكامل</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );})}
        </div>
      )}
    </div>
  );
}
