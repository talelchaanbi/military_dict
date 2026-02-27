"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ImageZoom } from "@/components/ui/image-zoom";
import { Search, Plus, Trash2, X, Filter, Image as ImageIcon, ImageOff } from "lucide-react";

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
  const [showCreate, setShowCreate] = useState(false);
  const [imageFilter, setImageFilter] = useState<"all" | "with" | "without">("all");

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

  // Reload groups only when section changes
  useEffect(() => {
    if (sectionNumber) {
      loadGroups(sectionNumber);
      setGroupId("all");
    }
  }, [sectionNumber]);

  // Reload terms when section or query changes (with debounce for query)
  useEffect(() => {
    if (sectionNumber) {
      const timer = setTimeout(() => {
        loadTerms(sectionNumber, query);
      }, 500); 
      return () => clearTimeout(timer);
    }
  }, [sectionNumber, query]);

  async function onSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sectionNumber) loadTerms(sectionNumber, query);
  }

  const selectedGroup = groups.find((g) => g.id === groupId) || null;
  const groupNumbers = selectedGroup
    ? new Set(selectedGroup.itemNumbers.map((n) => String(n).trim()))
    : null;

  const visibleTerms = (groupNumbers
    ? terms.filter((t) => groupNumbers.has(String(t.itemNumber || "").trim()))
    : terms
  ).filter(t => {
      // Image filter
      if (!supportsImages) return true;
      if (imageFilter === "with") return !!t.imageUrl;
      if (imageFilter === "without") return !t.imageUrl;
      return true;
  });

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
      setShowCreate(false); // Close after successful creation
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
      {/* Header & Controls */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 border-b space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-1 gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="بحث..."
                className="pl-9"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring"
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

              {groups.length > 0 && (
                <select
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring max-w-[200px]"
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
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
              )}
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto justify-end">
            {supportsImages && (
              <div className="flex border rounded-md overflow-hidden bg-background">
                <button
                  type="button"
                  onClick={() => setImageFilter("all")}
                  className={`px-3 py-2 text-sm transition-colors ${imageFilter === "all" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                  title="الكل"
                >
                  الكل
                </button>
                <button
                  type="button"
                  onClick={() => setImageFilter("with")}
                  className={`px-3 py-2 text-sm transition-colors border-r border-l ${imageFilter === "with" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                  title="مع صورة"
                >
                  <ImageIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setImageFilter("without")}
                  className={`px-3 py-2 text-sm transition-colors ${imageFilter === "without" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                  title="بدون صورة"
                >
                  <ImageOff className="h-4 w-4" />
                </button>
              </div>
            )}
            
            <Button 
              onClick={() => setShowCreate(!showCreate)} 
              variant={showCreate ? "secondary" : "default"}
              className="gap-2"
            >
              {showCreate ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showCreate ? "إلغاء" : "إضافة جديد"}
            </Button>
          </div>
        </div>
      </div>

      {/* Creation Form */}
      {showCreate && (
        <Card className="border-dashed border-2 animate-in fade-in slide-in-from-top-4">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">
              {supportsImages ? "إضافة رمز جديد" : "إضافة مصطلح جديد"}
            </h3>
            <form className="grid gap-4 sm:grid-cols-2" onSubmit={onCreate}>
              {supportsImages ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">مصطلح / معنى الرمز</label>
                    <Input name="term" placeholder="مثال: دبابة قتال رئيسية" required autoFocus />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">ملاحظات (اختياري)</label>
                    <Input name="description" placeholder="ملاحظات إضافية..." />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-sm font-medium">صورة الرمز</label>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {createImageFile ? (
                            <div className="flex flex-col items-center gap-2">
                              <ImageIcon className="h-8 w-8 text-primary" />
                              <p className="text-sm font-medium">{createImageFile.name}</p>
                              <p className="text-xs text-muted-foreground">اضغط للتغيير</p>
                            </div>
                          ) : (
                            <>
                              <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground">
                                <span className="font-semibold">اضغط لرفع صورة</span>
                              </p>
                              <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
                            </>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif"
                          className="hidden"
                          onChange={(e) => setCreateImageFile(e.target.files?.[0] || null)}
                        />
                      </label>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">المصطلح</label>
                    <Input name="term" placeholder="المصطلح" required autoFocus />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">الاختصار (اختياري)</label>
                    <Input name="abbreviation" placeholder="الاختصار" />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-sm font-medium">الشرح</label>
                    <Input name="description" placeholder="الشرح الكامل..." />
                  </div>
                </>
              )}

              <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>إلغاء</Button>
                <Button type="submit" disabled={creating} className="w-32">
                  {creating ? "جارٍ الحفظ..." : "حفظ"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Results List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-muted-foreground text-sm px-1">
          <span>{visibleTerms.length} نتيجة</span>
          {visibleTerms.length === 0 && query && <span>لا توجد نتائج مطابقة لـ "{query}"</span>}
        </div>

        <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
          {supportsImages ? (
            <div className="grid grid-cols-12 divide-x divide-x-reverse border-b bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <div className="col-span-1 p-3 text-center border-l">ID</div>
              <div className="col-span-2 p-3 text-center border-l">الرمز</div>
              <div className="col-span-4 p-3 text-center border-l">المعنى</div>
              <div className="col-span-4 p-3 text-center border-l">ملاحظات</div>
              <div className="col-span-1 p-3 text-center">إجراءات</div>
            </div>
          ) : (
            <div className="grid grid-cols-12 divide-x divide-x-reverse border-b bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <div className="col-span-1 p-3 text-center border-l">ID</div>
              <div className="col-span-3 p-3 text-center border-l">المصطلح</div>
              <div className="col-span-6 p-3 text-center border-l">الشرح</div>
              <div className="col-span-1 p-3 text-center border-l">اختصار</div>
              <div className="col-span-1 p-3 text-center">إجراءات</div>
            </div>
          )}
          
          <div className="divide-y max-h-[70vh] overflow-auto scrollbar-thin">
            {visibleTerms.map((t) => (
              <div key={t.id} className="grid grid-cols-12 divide-x divide-x-reverse text-sm items-center hover:bg-muted/30 transition-colors group">
                <div className="col-span-1 p-2 font-mono text-xs text-muted-foreground text-center border-l h-full flex items-center justify-center">
                  {t.id}
                </div>
                
                {supportsImages ? (
                  <div className="col-span-2 p-2 border-l h-full flex items-center justify-center">
                    <div className="flex flex-col gap-2 items-center">
                        {t.imageUrl ? (
                          <div className="flex items-center gap-2">
                             <div className="border rounded bg-muted/10 p-1">
                                <ImageZoom
                                  src={t.imageUrl}
                                  alt={t.term}
                                  className="h-10 w-auto object-contain"
                                />
                             </div>
                             <div className="flex flex-col gap-1">
                                <label className="cursor-pointer inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted text-muted-foreground hover:text-primary transition-colors" title="تغيير الصورة">
                                  <ImageIcon className="h-4 w-4" />
                                  <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp,image/gif"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        if (!confirm("استبدال الصورة الحالية؟")) {
                                          e.currentTarget.value = "";
                                          return;
                                        }
                                        onUploadImage(t.id, file);
                                      }
                                      e.currentTarget.value = "";
                                    }}
                                  />
                                </label>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                  title="حذف الصورة"
                                  onClick={() => {
                                    if (!confirm("هل أنت متأكد من حذف الصورة؟")) return;
                                    onUpdate(t.id, { imageUrl: null });
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                             </div>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-full h-14 rounded border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30 cursor-pointer transition-all p-2 text-muted-foreground hover:text-primary">
                            <ImageIcon className="h-5 w-5 mb-1 opacity-50" />
                            <span className="text-[10px] font-medium">رفع صورة</span>
                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp,image/gif"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    onUploadImage(t.id, file);
                                  }
                                  e.currentTarget.value = "";
                                }}
                              />
                          </label>
                        )}
                    </div>
                  </div>
                ) : null}

                <div className={`${supportsImages ? "col-span-4" : "col-span-3"} p-2 border-l h-full flex items-start`}>
                  <Input
                    className="w-full h-full min-h-[40px] bg-transparent border-transparent hover:border-input focus:border-input rounded px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                    defaultValue={t.term}
                    onBlur={(e) => onUpdate(t.id, { term: e.target.value })}
                  />
                </div>
                
                <div className={`${supportsImages ? "col-span-4" : "col-span-6"} p-2 border-l h-full flex items-start`}>
                  <Input
                    className="w-full h-full min-h-[40px] bg-transparent border-transparent hover:border-input focus:border-input rounded px-2 text-sm text-muted-foreground focus:text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                    defaultValue={t.description || ""}
                    placeholder="-"
                    onBlur={(e) => onUpdate(t.id, { description: e.target.value })}
                  />
                </div>

                {supportsImages ? null : (
                  <div className="col-span-1 p-2 border-l h-full flex items-start">
                    <Input
                      className="w-full h-full min-h-[40px] bg-transparent border-transparent hover:border-input focus:border-input rounded px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all text-center"
                      defaultValue={t.abbreviation || ""}
                      placeholder="-"
                      onBlur={(e) => onUpdate(t.id, { abbreviation: e.target.value })}
                    />
                  </div>
                )}
                
                <div className="col-span-1 p-2 h-full flex items-center justify-center">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                    onClick={() => onDelete(t.id)}
                    title="حذف العنصر"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {visibleTerms.length === 0 && (
              <div className="py-12 flex flex-col items-center justify-center text-muted-foreground gap-2">
                <Search className="h-10 w-10 text-muted-foreground/30" />
                <p>لا توجد نتائج</p>
                {query && <Button variant="link" onClick={() => setQuery("")} className="h-auto p-0">مسح البحث</Button>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
