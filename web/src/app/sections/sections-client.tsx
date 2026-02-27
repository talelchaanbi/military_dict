"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, List, Search, LayoutGrid, List as ListIcon, BookOpen, 
  Shield, Users, Crosshair, Anchor, Plane, Truck, Activity, Radio, 
  Cpu, Database, Wrench, GraduationCap, Gavel, Scale, Globe, Target, Briefcase,
  Zap, Navigation, Layers, Server, Map as MapIcon, Box, ChevronLeft
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

  if (number === 1) return Users; 
  if (number === 2) return Shield; 
  if (number === 3) return Target; 
  if (number === 4) return Truck; 
  if (number === 5) return LayoutGrid;
  if (number === 6) return Radio; 
  if (number >= 1200 && number < 1300) return Layers;
  if (number >= 1300) return Server;

  if (number === 7) return GraduationCap;
  if (number === 8) return Wrench;
  if (number === 9) return Activity;

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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" dir="rtl">
      
      {/* Search & Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card/60 backdrop-blur-md p-4 rounded-xl shadow-sm border sticky top-20 z-10 transition-all hover:shadow-md">
        
        <div className="relative w-full md:w-96 group">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors z-10" />
          <Input
            placeholder="بحث (مثال: 'إمداد', '1205')..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10 pl-4 bg-background/50 focus:bg-background transition-all border-muted-foreground/20 focus:border-primary/50 text-right w-full shadow-sm"
          />
        </div>
        
        <div className="flex items-center gap-3 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
          <div className="flex items-center bg-muted/40 p-1.5 rounded-lg border border-border/40 gap-1">
            <Button
              variant={filter === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("all")}
              className={cn("text-xs h-8 px-4 rounded-md transition-all font-medium", filter === "all" && "shadow-sm")}
            >
              الكل
            </Button>
            <Button
              variant={filter === "terms" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("terms")}
              className={cn("text-xs h-8 px-3 rounded-md transition-all gap-2 font-medium", filter === "terms" && "shadow-sm")}
            >
              <List className="h-3.5 w-3.5" />
              مصطلحات
            </Button>
             <Button
              variant={filter === "document" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("document")}
              className={cn("text-xs h-8 px-3 rounded-md transition-all gap-2 font-medium", filter === "document" && "shadow-sm")}
            >
              <FileText className="h-3.5 w-3.5" />
              وثائق
            </Button>
          </div>

          <div className="flex items-center bg-muted/40 p-1.5 rounded-lg border border-border/40 gap-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className={cn("h-8 w-8 rounded-md transition-all", viewMode === "grid" && "shadow-sm")}
              title="عرض شبكي"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
              className={cn("h-8 w-8 rounded-md transition-all", viewMode === "list" && "shadow-sm")}
              title="عرض القائمة"
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredSections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center text-muted-foreground bg-muted/10 rounded-2xl border-2 border-dashed border-border/50">
          <div className="bg-muted/30 p-4 rounded-full mb-4">
            <BookOpen className="h-10 w-10 opacity-40" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">لم يتم العثور على أي قسم</h3>
          <p className="text-sm opacity-80 mt-1 mb-4 max-w-sm">حاول تغيير كلمات البحث أو إزالة المرشحات لرؤية المزيد من النتائج.</p>
          <Button 
            variant="outline" 
            onClick={() => { setSearch(""); setFilter("all"); }}
            className="rounded-full px-6"
          >
            مسح المرشحات
          </Button>
        </div>
      ) : (
        /* Results Grid/List */
        <div className={cn(
          "grid gap-5 transition-all",
          viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        )}>
          {filteredSections.map((s) => {
            const Icon = getSectionIcon(s.number, s.title);
            const isTerms = s.type === "terms";

            return (
              <Link
                key={s.number}
                href={`/sections/${s.number}`}
                className={cn(
                  "group block transition-all duration-200 hover:-translate-y-1 active:scale-[0.98]",
                  "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 focus:ring-offset-background rounded-xl"
                )}
              >
                <Card className={cn(
                  "h-full overflow-hidden border-border/40 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300",
                  "bg-card hover:bg-card/80",
                  viewMode === "list" && "flex flex-row items-center p-3"
                )}>
                  {viewMode === "grid" ? (
                    <>
                      {/* Gradient Line Top */}
                      <div className={cn(
                        "h-1.5 w-full transition-all duration-300",
                        isTerms ? "bg-blue-500/40 group-hover:bg-blue-500" : "bg-orange-500/40 group-hover:bg-orange-500"
                      )} />
                      
                      <CardHeader className="p-5 space-y-4">
                        <div className="flex justify-between items-start">
                          <span className={cn(
                            "text-xs font-bold px-3 py-1.5 rounded-md border transition-colors shadow-sm",
                            isTerms 
                              ? "bg-blue-50 text-blue-700 border-blue-200 group-hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                              : "bg-orange-50 text-orange-700 border-orange-200 group-hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800"
                          )}>
                            القسم {s.number}
                          </span>
                           <div className={cn(
                             "p-2 rounded-lg transition-transform duration-300 group-hover:scale-110",
                             isTerms ? "bg-blue-50 dark:bg-blue-900/20" : "bg-orange-50 dark:bg-orange-900/20"
                           )}>
                             <Icon className={cn(
                              "h-5 w-5",
                               isTerms ? "text-blue-600 dark:text-blue-400" : "text-orange-600 dark:text-orange-400"
                            )} />
                           </div>
                        </div>
                        <CardTitle className="leading-snug text-lg font-semibold group-hover:text-primary transition-colors text-right line-clamp-2">
                          {s.title}
                        </CardTitle>
                      </CardHeader>
                    </>
                  ) : (
                    /* List View Layout */
                    <div className="flex items-center justify-between w-full px-2 py-1">
                      <div className="flex items-center gap-4">
                          <div className={cn(
                            "h-12 w-12 rounded-xl flex items-center justify-center border shadow-sm transition-transform group-hover:scale-105",
                            isTerms 
                              ? "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
                              : "bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800"
                          )}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div>
                              <span className="text-sm font-medium text-muted-foreground block text-right mb-0.5">القسم {s.number}</span>
                              <h3 className="font-semibold text-base group-hover:text-primary transition-colors text-right line-clamp-1">{s.title}</h3>
                          </div>
                      </div>
                      <ChevronLeft className="h-5 w-5 text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:-translate-x-1 transition-all" />
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