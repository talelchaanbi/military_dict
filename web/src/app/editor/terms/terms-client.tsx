"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ImageZoom } from "@/components/ui/image-zoom";

type Section = { number: number; title: string; type: "terms" | "document" };

type Group = {
  id: string;
  title: string;
  parentTitle?: string;
  subTitle?: string;
  itemNumbers: string[];
};

type Term = {
  id: number;
  itemNumber: string | null;
  term: string;
  description: string | null;
  abbreviation: string | null;
  imageUrl: string | null;
};

export default function TermsEditorClient() {
  const [sections, setSections] = useState<Section[]>([]);
  const [sectionNumber, setSectionNumber] = useState<number | null>(null);
  const [terms, setTerms] = useState<Term[]>([]);
  const [query, setQuery] = useState("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupId, setGroupId] = useState("all");
  const [createImageFile, setCreateImageFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);

  const supportsImages = sectionNumber !== null && sectionNumber >= 1301 && sectionNumber <= 1305;
  const isTermsSection = sectionNumber !== null && sectionNumber >= 1 && sectionNumber <= 11;

  async function loadSections() {
    const res = await fetch("/api/sections");
    const data = await res.json();
    const items = (data.sections || []).filter((s: Section) => s.type === "terms");
    setSections(items);
    if (!sectionNumber && items.length > 0) {
      setSectionNumber(items[0].number);
    }
  }

  async function loadTerms(number: number, q = "") {
    const pageSize = 200;
    let page = 1;
    let all: Term[] = [];

    while (true) {
      const res = await fetch(
        `/api/sections/${number}/terms?q=${encodeURIComponent(q)}&page=${page}&pageSize=${pageSize}`
      );
      const data = await res.json();
      if (!res.ok) break;
      const batch = (data.terms || []) as Term[];
      all = all.concat(batch);
      if (batch.length < pageSize) break;
      page += 1;
    }

    setTerms(all);
  }

  async function loadGroups(number: number) {
    const res = await fetch(`/api/sections/${number}/groups`);
    const data = await res.json();
    if (res.ok) setGroups(data.groups || []);
    else setGroups([]);
  }

  useEffect(() => {
    loadSections();
  }, []);

  useEffect(() => {
    if (sectionNumber) {
      loadTerms(sectionNumber, query);
      loadGroups(sectionNumber);
      setGroupId("all");
    }
  }, [sectionNumber]);

  async function onSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sectionNumber) loadTerms(sectionNumber, query);
  }

  const selectedGroup = groups.find((g) => g.id === groupId) || null;
  const groupNumbers = selectedGroup
    ? new Set(selectedGroup.itemNumbers.map((n) => String(n).trim()))
    : null;

  const visibleTerms = groupNumbers
    ? terms.filter((t) => groupNumbers.has(String(t.itemNumber || "").trim()))
    : terms;

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!sectionNumber) return;
    const form = new FormData(e.currentTarget);
    const term = String(form.get("term") || "").trim();
    const descriptionRaw = form.get("description");
    const description = descriptionRaw ? String(descriptionRaw) : null;
    const abbreviationRaw = form.get("abbreviation");
    const abbreviation = abbreviationRaw ? String(abbreviationRaw) : null;

    if (!term) return;

    setCreating(true);
    try {
      const payload = supportsImages
        ? { term, description }
        : { term, description, abbreviation };

      const res = await fetch(`/api/sections/${sectionNumber}/terms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as { term?: { id: number } };
      if (!res.ok || !data.term?.id) {
        alert("فشل الإضافة");
        return;
      }

      const createdId = data.term.id;
      if (supportsImages && createImageFile) {
        await onUploadImage(createdId, createImageFile);
      }

      (e.target as HTMLFormElement).reset();
      setCreateImageFile(null);
      await loadTerms(sectionNumber, query);
    } finally {
      setCreating(false);
    }
  }

  async function onUpdate(id: number, patch: Partial<Term>) {
    await fetch(`/api/terms/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (sectionNumber) loadTerms(sectionNumber, query);
  }

  async function onUploadImage(termId: number, file: File) {
    const form = new FormData();
    form.set("file", file);
    const res = await fetch(`/api/terms/${termId}/image`, {
      method: "POST",
      body: form,
    });
    const data = (await res.json()) as { url?: string; error?: string };
    if (!res.ok || !data.url) {
      alert(data.error || "فشل رفع الصورة");
      return;
    }
    await onUpdate(termId, { imageUrl: data.url });
  }

  async function onDelete(id: number) {
    if (!confirm("حذف المصطلح؟")) return;
    await fetch(`/api/terms/${id}`, { method: "DELETE" });
    if (sectionNumber) loadTerms(sectionNumber, query);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid gap-3 sm:grid-cols-4">
            <select
              aria-label="القسم"
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={sectionNumber ?? ""}
              onChange={(e) => setSectionNumber(Number(e.target.value))}
            >
              {sections.some((s) => s.number >= 1 && s.number <= 11) ? (
                <optgroup label="المصطلحات">
                  {sections
                    .filter((s) => s.number >= 1 && s.number <= 11)
                    .map((s) => (
                      <option key={s.number} value={s.number}>
                        {s.title}
                      </option>
                    ))}
                </optgroup>
              ) : null}

              {sections.some((s) => s.number >= 1301 && s.number <= 1305) ? (
                <optgroup label="الرموز">
                  {sections
                    .filter((s) => s.number >= 1301 && s.number <= 1305)
                    .map((s) => (
                      <option key={s.number} value={s.number}>
                        {s.title}
                      </option>
                    ))}
                </optgroup>
              ) : null}

              {sections.some((s) => !(s.number >= 1 && s.number <= 11) && !(s.number >= 1301 && s.number <= 1305)) ? (
                <optgroup label="أخرى">
                  {sections
                    .filter(
                      (s) =>
                        !(s.number >= 1 && s.number <= 11) &&
                        !(s.number >= 1301 && s.number <= 1305)
                    )
                    .map((s) => (
                      <option key={s.number} value={s.number}>
                        {s.title}
                      </option>
                    ))}
                </optgroup>
              ) : null}
            </select>
            <select
              aria-label="العناوين الفرعية"
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              disabled={groups.length === 0}
            >
              <option value="all">كل العناوين</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.parentTitle && g.subTitle
                    ? `${g.parentTitle} / ${g.subTitle}`
                    : g.title}
                </option>
              ))}
            </select>
            <form className="sm:col-span-2 flex gap-2" onSubmit={onSearch}>
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="بحث" />
              <Button type="submit" variant="outline">بحث</Button>
            </form>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <form className="grid gap-3 sm:grid-cols-4" onSubmit={onCreate}>
            {supportsImages ? (
              <>
                <Input name="term" placeholder="معنى الرمز" required />
                <Input name="description" placeholder="ملاحظات" className="sm:col-span-2" />
                <div className="sm:col-span-4 flex flex-col gap-2">
                  <div className="text-xs text-muted-foreground">
                    هذا القسم خاص بالرموز: ارفع صورة للرمز ثم اكتب المعنى.
                  </div>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="block text-sm"
                    onChange={(e) => setCreateImageFile(e.target.files?.[0] || null)}
                  />
                </div>
              </>
            ) : (
              <>
                <Input name="term" placeholder="المصطلح" required />
                <Input name="abbreviation" placeholder="الاختصار" />
                <Input name="description" placeholder="الشرح" className="sm:col-span-2" />
                {isTermsSection ? (
                  <div className="sm:col-span-4 text-xs text-muted-foreground">
                    هذا القسم خاص بالمصطلحات.
                  </div>
                ) : null}
              </>
            )}

            <Button type="submit" className="w-fit" disabled={creating}>
              {creating ? "جارٍ الإضافة…" : "إضافة"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="rounded-lg border bg-card">
        {supportsImages ? (
          <div className="grid grid-cols-12 gap-0 border-b bg-muted/50 px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <div className="col-span-1">ID</div>
            <div className="col-span-2">صورة</div>
            <div className="col-span-4">معنى الرمز</div>
            <div className="col-span-4">ملاحظات</div>
            <div className="col-span-1">إجراء</div>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-0 border-b bg-muted/50 px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <div className="col-span-1">ID</div>
            <div className="col-span-3">المصطلح</div>
            <div className="col-span-6">الشرح</div>
            <div className="col-span-1">اختصار</div>
            <div className="col-span-1">إجراء</div>
          </div>
        )}
        <div className="divide-y">
          {visibleTerms.map((t) => (
            <div key={t.id} className="grid grid-cols-12 gap-2 px-4 py-3 text-sm items-start">
              <div className="col-span-1 h-8 flex items-center font-mono text-xs text-muted-foreground">
                {t.id}
              </div>
              {supportsImages ? (
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    {t.imageUrl ? (
                      <ImageZoom
                        src={t.imageUrl}
                        alt={t.term}
                        className="h-16 w-24 rounded border bg-background"
                      />
                    ) : (
                      <div className="h-16 w-24 rounded border bg-muted/30" />
                    )}

                    <div className="flex flex-col gap-1">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        className="block w-[150px] text-xs"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (t.imageUrl && !confirm("استبدال الصورة الحالية؟")) {
                              e.currentTarget.value = "";
                              return;
                            }
                            onUploadImage(t.id, file);
                          }
                          e.currentTarget.value = "";
                        }}
                      />
                      {t.imageUrl ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs text-destructive"
                          onClick={() => {
                            if (!confirm("حذف الصورة؟")) return;
                            onUpdate(t.id, { imageUrl: null });
                          }}
                        >
                          حذف الصورة
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}
              <Input
                className={`${supportsImages ? "col-span-4" : "col-span-3"} h-8`}
                defaultValue={t.term}
                onBlur={(e) => onUpdate(t.id, { term: e.target.value })}
              />
              <Input
                className={`${supportsImages ? "col-span-4" : "col-span-6"} h-8`}
                defaultValue={t.description || ""}
                onBlur={(e) => onUpdate(t.id, { description: e.target.value })}
              />
              {supportsImages ? null : (
                <Input
                  className="col-span-1 h-8"
                  defaultValue={t.abbreviation || ""}
                  onBlur={(e) => onUpdate(t.id, { abbreviation: e.target.value })}
                />
              )}
              <Button size="sm" variant="outline" className="col-span-1" onClick={() => onDelete(t.id)}>
                حذف
              </Button>
            </div>
          ))}
          {visibleTerms.length === 0 && (
            <div className="p-6 text-center text-muted-foreground">لا توجد نتائج</div>
          )}
        </div>
      </div>
    </div>
  );
}
