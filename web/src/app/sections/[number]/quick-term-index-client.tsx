"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export type QuickTerm = {
  id: number;
  itemNumber: string | null;
  term: string;
};

type TermHit = {
  id: number;
  itemNumber: string | null;
  term: string;
  abbreviation: string | null;
  description: string | null;
};

export function QuickTermIndexClient({
  sectionNumber,
  quickTerms,
}: {
  sectionNumber: number;
  quickTerms: QuickTerm[];
}) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [hits, setHits] = useState<TermHit[]>([]);
  const [open, setOpen] = useState(false);
  const lastQueryRef = useRef("");

  const normalizedValue = useMemo(() => value.trim(), [value]);

  useEffect(() => {
    const q = normalizedValue;
    if (q.length < 2) {
      setHits([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    const handle = window.setTimeout(async () => {
      try {
        lastQueryRef.current = q;
        const url = `/api/sections/${sectionNumber}/terms?q=${encodeURIComponent(q)}&page=1&pageSize=8`;
        const res = await fetch(url, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        if (!res.ok) {
          setHits([]);
          setOpen(false);
          return;
        }
        const data = (await res.json()) as { terms?: TermHit[] };
        if (lastQueryRef.current !== q) return;
        const terms = Array.isArray(data.terms) ? data.terms : [];
        setHits(terms);
        setOpen(true);
      } catch {
        // ignore abort/network
        setHits([]);
        setOpen(false);
      } finally {
        if (lastQueryRef.current === q) setLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(handle);
    };
  }, [normalizedValue, sectionNumber]);

  function goToTerm(termId: number) {
    setOpen(false);
    router.push(`/sections/${sectionNumber}?term=${termId}`);
  }

  function goToSearch() {
    const q = normalizedValue;
    if (!q) return;
    setOpen(false);
    router.push(`/sections/${sectionNumber}?q=${encodeURIComponent(q)}`);
  }

  return (
    <Card className="mb-6">
      <CardContent className="pt-6 grid gap-4">
        <div className="flex flex-col gap-2">
          <div className="text-sm font-semibold">وصول سريع</div>
          <div className="text-xs text-muted-foreground">
            اختر مصطلحًا شائعًا أو اكتب للعثور على المصطلح بسرعة.
          </div>
        </div>

        {quickTerms.length ? (
          <div className="flex flex-wrap gap-2">
            {quickTerms.map((t) => (
              <Button key={t.id} variant="secondary" size="sm" asChild>
                <Link href={`/sections/${sectionNumber}?term=${t.id}`}>{t.term}</Link>
              </Button>
            ))}
          </div>
        ) : null}

        <div className="relative">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => {
              if (hits.length) setOpen(true);
            }}
            onBlur={() => {
              // small delay so click can register
              window.setTimeout(() => setOpen(false), 150);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (hits.length) goToTerm(hits[0].id);
                else goToSearch();
              }
              if (e.key === "Escape") {
                setOpen(false);
              }
            }}
            placeholder="اكتب مصطلحًا… (مثال: إنزال، رمي، إمداد)"
            className="pr-9 h-10"
          />

          {open ? (
            <div className="absolute z-50 mt-2 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
              <div className="max-h-80 overflow-auto p-1">
                {loading ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">جاري البحث…</div>
                ) : hits.length ? (
                  <div className="grid">
                    {hits.map((h) => (
                      <button
                        key={h.id}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => goToTerm(h.id)}
                        className="text-right w-full rounded-sm px-3 py-2 text-sm hover:bg-accent"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="font-medium">{h.term}</div>
                          <div className="shrink-0 text-xs text-muted-foreground font-mono">
                            {h.itemNumber || "–"}
                          </div>
                        </div>
                        {h.abbreviation ? (
                          <div className="mt-1 text-xs text-muted-foreground">{h.abbreviation}</div>
                        ) : null}
                      </button>
                    ))}

                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={goToSearch}
                      className="text-right w-full rounded-sm px-3 py-2 text-xs text-muted-foreground hover:bg-accent"
                    >
                      عرض كل النتائج لـ “{normalizedValue}”
                    </button>
                  </div>
                ) : (
                  <div className="px-3 py-2 text-sm text-muted-foreground">لا توجد نتائج.</div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
