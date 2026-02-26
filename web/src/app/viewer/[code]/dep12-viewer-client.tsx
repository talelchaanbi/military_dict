"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileText, Map, Layers, Search } from "lucide-react";

export type Dep12DocItem = {
  code: string;
  title: string;
  description?: string;
  kind: "sections" | "visuals";
};

function iconFor(kind: Dep12DocItem["kind"]) {
  if (kind === "visuals") return Map;
  return FileText;
}

export function Dep12ViewerClient({
  items,
  title,
}: {
  items: Dep12DocItem[];
  title: string;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => {
      const haystack = `${it.code} ${it.title} ${it.description || ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [items, query]);

  const sections = filtered.filter((i) => i.kind === "sections");
  const visuals = filtered.filter((i) => i.kind === "visuals");

  return (
    <div className="grid gap-6">
      <div className="rounded-xl border bg-card/70 p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid gap-1">
            <div className="text-lg font-bold">{title}</div>
            <div className="text-sm text-muted-foreground">اختر قسمًا أو ابحث بالاسم.</div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          </div>
        </div>

        <div className="mt-4 relative">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث: خرائط، الشفافات، القسم…"
            className="pr-9 h-10"
          />
        </div>
      </div>

      <div className="grid gap-6">
        <SectionBlock title="الأقسام" icon={Layers} items={sections} />
        <SectionBlock title="الخرائط والملحقات" icon={Map} items={visuals} />
      </div>

      {!filtered.length ? (
        <div className="text-sm text-muted-foreground">لا توجد نتائج.</div>
      ) : null}
    </div>
  );
}

function SectionBlock({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: Dep12DocItem[];
}) {
  if (!items.length) return null;

  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <Icon className="h-4 w-4" />
        {title}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <DocCard key={item.code} item={item} />
        ))}
      </div>
    </div>
  );
}

function DocCard({ item }: { item: Dep12DocItem }) {
  const Icon = iconFor(item.kind);
  const href = `/uploads/docs/${encodeURIComponent(item.code)}.html`;

  return (
    <Link href={href} className="block h-full">
      <Card className="h-full hover:border-primary hover:shadow-lg transition-all">
        <CardContent className="pt-6 grid gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2.5 rounded-full">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="grid gap-1">
                <div className="font-semibold leading-tight">{item.title}</div>
                {item.description ? (
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                ) : null}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
