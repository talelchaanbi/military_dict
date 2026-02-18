"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, List, Search, LayoutGrid, List as ListIcon, BookOpen, 
  Shield, Users, Crosshair, Anchor, Plane, Truck, Activity, Radio, 
  Cpu, Database, Wrench, GraduationCap, Gavel, Scale, Globe, Target, Briefcase,
  Zap, Navigation, Layers, Server, Map as MapIcon, Box
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Section {
  number: number;
  title: string;
  type: string; 
}

interface SectionsClientProps {
  sections: Section[];
}

function getSectionIcon(number: number, title: string) {
  const t = title ? title.toLowerCase() : "";
  
  // Check keywords first as they are more specific than generic numbers
  if (t.includes("إمداد") || t.includes("لوجست") || t.includes("نقل") || t.includes("مركبات")) return Truck;
  if (t.includes("طيران") || t.includes("جوي")) return Plane;
  if (t.includes("بحر")) return Anchor;
  if (t.includes("طب") || t.includes("صحة") || t.includes("علاج")) return Activity;
  if (t.includes("إشارة") || t.includes("اتصال") || t.includes("لاسلكي")) return Radio;
  if (t.includes("مهندس") || t.includes("صيانة") || t.includes("إنشاء")) return Wrench;
  if (t.includes("حاسب") || t.includes("كمبيوتر") || t.includes("تقنية")) return Cpu;
  if (t.includes("بيانات") || t.includes("معلومات")) return Database;
  if (t.includes("تدريب") || t.includes("تعليم")) return GraduationCap;
  if (t.includes("قانون") || t.includes("قضاء")) return Gavel;
  if (t.includes("ملاحة") || t.includes("خريطة") || t.includes("مساحة")) return MapIcon;
  if (t.includes("تذخیر") || t.includes("ذخیرة") || t.includes("سلاح")) return Crosshair;
  if (t.includes("فرد") || t.includes("أفراد")) return Users;
  if (t.includes("أمن") || t.includes("حراسة")) return Shield;

  // Fallback to section numbers if no keyword matches
  if (number === 1) return Users; 
  if (number === 2) return Shield; 
  if (number === 3) return Target; 
  if (number === 4) return Truck; 
  if (number === 5) return LayoutGrid;
  if (number === 6) return Radio; 
  if (number >= 1200 && number < 1300) return Layers;
  if (number >= 1300) return Server;

  // Default icons based on some likely broad categories if numbers align
  if (number === 7) return GraduationCap;
  if (number === 8) return Wrench;
  if (number === 9) return Activity;

  // Generic fallback
  return Box;
}

export function SectionsClient({ sections }: SectionsClientProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "terms" | "document">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredSections = useMemo(() => {
    return sections.filter((s) => {
      const matchesSearch =
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.number.toString().includes(search);
      const matchesFilter = filter === "all" || s.type === filter;
      return matchesSearch && matchesFilter;
    });
  }, [sections, search, filter]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card/50 backdrop-blur-sm p-4 rounded-xl shadow-sm border sticky top-20 z-10 transition-all hover:shadow-md">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          <Input
            placeholder="بحث (مثال: 'إمداد', '1205')..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background/50 focus:bg-background transition-all border-muted-foreground/20 focus:border-primary/50 text-right dir-rtl"
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <div className="flex items-center bg-muted/50 p-1 rounded-lg border border-border/50">
            <Button
              variant={filter === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("all")}
              className="text-xs h-8 px-3 rounded-md transition-all"
            >
              الكل
            </Button>
            <Button
              variant={filter === "terms" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("terms")}
              className="text-xs h-8 px-3 rounded-md transition-all gap-2"
            >
              <List className="h-3 w-3" />
              مصطلحات
            </Button>
             <Button
              variant={filter === "document" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("document")}
              className="text-xs h-8 px-3 rounded-md transition-all gap-2"
            >
              <FileText className="h-3 w-3" />
              وثائق
            </Button>
          </div>

          <div className="flex items-center bg-muted/50 p-1 rounded-lg border border-border/50 ml-2">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className="h-8 w-8 rounded-md"
              title="عرض شبكي"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
              className="h-8 w-8 rounded-md"
              title="عرض القائمة"
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {filteredSections.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border/50">
          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">لم يتم العثور على أي قسم</p>
          <p className="text-sm opacity-70">حاول تغيير معايير البحث أو تصفية النتائج</p>
          <Button 
            variant="link" 
            onClick={() => { setSearch(""); setFilter("all"); }}
            className="mt-2"
          >
            مسح المرشحات
          </Button>
        </div>
      ) : (
        <div className={cn(
          "grid gap-4 transition-all",
          viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
        )}>
          {filteredSections.map((s, index) => {
            const Icon = getSectionIcon(s.number, s.title);
            return (
              <Link
                key={s.number}
                href={`/sections/${s.number}`}
                className={cn(
                  "group block transition-all hover:scale-[1.02] active:scale-[0.98]",
                  "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 rounded-xl"
                )}
              >
                <Card className={cn(
                  "h-full overflow-hidden border-border/50 hover:border-primary/50 hover:shadow-lg transition-all",
                  "bg-gradient-to-br from-card to-card/50",
                  viewMode === "list" && "flex flex-row items-center p-2"
                )}>
                  {viewMode === "grid" ? (
                    <>
                      <div className="relative h-2 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 group-hover:from-primary/40 group-hover:via-primary/60 group-hover:to-primary/40 transition-all" />
                      <CardHeader className="p-5 space-y-3">
                        <div className="flex justify-between items-start">
                          <span className={cn(
                            "text-xs font-bold px-2.5 py-1 rounded-full border transition-colors",
                            s.type === "terms" 
                              ? "bg-blue-500/10 text-blue-600 border-blue-500/20 group-hover:bg-blue-500/20 dark:text-blue-400"
                              : "bg-orange-500/10 text-orange-600 border-orange-500/20 group-hover:bg-orange-500/20 dark:text-orange-400"
                          )}>
                            القسم {s.number}
                          </span>
                           <Icon className={cn(
                            "h-5 w-5 transition-transform group-hover:scale-110",
                             s.type === "terms" ? "text-blue-500/70" : "text-orange-500/70"
                          )} />
                        </div>
                        <CardTitle className="leading-snug text-lg font-semibold group-hover:text-primary transition-colors text-right" dir="rtl">
                          {s.title}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground/70 truncate text-right dir-rtl">
                          {s.type === "terms" ? "مصطلحات وتعاريف" : "وثائق فنية"}
                        </p>
                      </CardHeader>
                    </>
                  ) : (
                    <div className="flex items-center justify-between w-full p-2" dir="rtl">
                      <div className="flex items-center gap-4">
                          <div className={cn(
                            "h-10 w-10 rounded-lg flex items-center justify-center border",
                            s.type === "terms" 
                              ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                              : "bg-orange-500/10 text-orange-600 border-orange-500/20"
                          )}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                              <span className="text-sm font-medium text-muted-foreground block text-right">القسم {s.number}</span>
                              <h3 className="font-semibold text-base group-hover:text-primary transition-colors text-right">{s.title}</h3>
                          </div>
                      </div>
                    </div>
                  )}
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
