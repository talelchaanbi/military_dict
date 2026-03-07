"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

import { motion } from "framer-motion";
import { 
  FileText, List, Search, LayoutGrid, List as ListIcon, BookOpen, 
  Shield, Users, Crosshair, Anchor, Plane, Truck, Activity, Radio, 
  Cpu, Database, Wrench, GraduationCap, Gavel, Scale, Globe, Target, Briefcase,
  Zap, Navigation, Layers, Server, Map as MapIcon, Box, ChevronLeft, AlertTriangle
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
  switch (number) {
    case 1: return Shield;
    case 2: return Anchor;
    case 3: return Plane;
    case 4: return Navigation;
    case 5: return Target;
    case 6: return Zap;
    case 7: return Crosshair;
    case 8: return AlertTriangle;
    case 9: return Radio;
    case 10: return Truck;
    case 11: return GraduationCap;
    case 12: return MapIcon;
    case 13: return Layers;
    default: return Box;
  }
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
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl shadow-sm border sticky top-20 z-30 transition-shadow hover:shadow-md">
        
        <div className="relative w-full md:w-96 group">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors z-10" />
          <Input
            placeholder="بحث (مثال: 'إمداد', '1205')..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10 pl-4 bg-background focus:bg-background transition-all border-muted-foreground/20 focus:border-primary/50 text-right w-full shadow-sm"
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
          "grid gap-4 transition-all",
          viewMode === "grid"
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            : "grid-cols-1"
        )}>
          {filteredSections.map((s) => {
            const Icon = getSectionIcon(s.number, s.title);
            const isTerms = s.type === "terms";

            return (
              <Link
                key={s.number}
                href={`/sections/${s.number}`}
                className="group block focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 focus:ring-offset-background rounded-xl"
              >
                <motion.div
                  whileHover={{ y: -4, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="h-full transform-gpu"
                >
                  {viewMode === "grid" ? (
                    /* ── GRID CARD ── */
                    <div className={cn(
                      "h-full flex flex-col rounded-xl border bg-card overflow-hidden",
                      "shadow-sm group-hover:shadow-md transition-shadow duration-300",
                      isTerms
                        ? "group-hover:border-primary/50"
                        : "group-hover:border-orange-400/50"
                    )}>
                      {/* Coloured top stripe */}
                      <div className={cn(
                        "h-1.5 w-full",
                        isTerms ? "bg-primary" : "bg-orange-500"
                      )} />

                      <div className="relative flex flex-col flex-1 p-4 gap-3">
                        {/* Background watermark logo */}
                        <div className="absolute bottom-2 left-1 pointer-events-none select-none overflow-hidden">
                          <Icon
                            strokeWidth={1}
                            className={cn(
                              "w-28 h-28 -rotate-12 transition-all duration-500 group-hover:rotate-0 group-hover:scale-110",
                              isTerms
                                ? "text-primary/10 group-hover:text-primary/20"
                                : "text-orange-500/10 group-hover:text-orange-500/20"
                            )}
                          />
                        </div>

                        {/* Icon + badge row */}
                        <div className="flex items-center justify-between">
                          <div className={cn(
                            "flex items-center justify-center w-11 h-11 rounded-xl border shadow-sm transition-transform duration-300 group-hover:scale-105",
                            isTerms
                              ? "bg-primary/10 text-primary border-primary/20 dark:bg-primary/20"
                              : "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800"
                          )}>
                            <Icon className="h-5 w-5" strokeWidth={1.5} />
                          </div>
                          <span className={cn(
                            "text-xs font-semibold px-2.5 py-1 rounded-full border",
                            isTerms
                              ? "bg-primary/10 border-primary/20 text-primary dark:bg-primary/20"
                              : "bg-orange-100 border-orange-200 text-orange-700 dark:bg-orange-900/30 dark:border-orange-800 dark:text-orange-400"
                          )}>
                            {s.number}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-sm font-bold leading-relaxed text-foreground group-hover:text-primary transition-colors text-center line-clamp-3 flex-1">
                          {s.title}
                        </h3>

                        {/* Footer CTA */}
                        <div className={cn(
                          "flex items-center justify-between pt-3 border-t",
                          isTerms ? "border-primary/10" : "border-orange-200/50 dark:border-orange-800/30"
                        )}>
                          <span className={cn(
                            "text-[11px] font-medium flex items-center gap-1.5",
                            isTerms ? "text-primary/70" : "text-orange-600/70 dark:text-orange-400/70"
                          )}>
                            <BookOpen className="h-3 w-3" />
                            {isTerms ? "تصفح المصطلحات" : "قراءة الوثيقة"}
                          </span>
                          <ChevronLeft className={cn(
                            "h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1",
                            isTerms ? "text-primary/60" : "text-orange-500/60"
                          )} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* ── LIST ROW ── */
                    <div className={cn(
                      "relative flex items-center gap-4 rounded-xl border bg-card px-4 py-3.5 overflow-hidden",
                      "shadow-sm group-hover:shadow-md transition-all duration-300",
                      isTerms
                        ? "group-hover:border-primary/50"
                        : "group-hover:border-orange-400/50"
                    )}>
                      {/* Background watermark logo */}
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none select-none">
                        <Icon
                          strokeWidth={1}
                          className={cn(
                            "w-16 h-16 -rotate-12 transition-all duration-500 group-hover:rotate-0 group-hover:scale-110",
                            isTerms
                              ? "text-primary/10 group-hover:text-primary/20"
                              : "text-orange-500/10 group-hover:text-orange-500/20"
                          )}
                        />
                      </div>
                      {/* Left colored border accent */}
                      <div className={cn(
                        "self-stretch w-1 rounded-full flex-shrink-0",
                        isTerms ? "bg-primary" : "bg-orange-500"
                      )} />

                      {/* Icon */}
                      <div className={cn(
                        "flex items-center justify-center w-12 h-12 rounded-xl border shadow-sm flex-shrink-0 transition-transform duration-300 group-hover:scale-105",
                        isTerms
                          ? "bg-primary/10 text-primary border-primary/20 dark:bg-primary/20"
                          : "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800"
                      )}>
                        <Icon className="h-6 w-6" strokeWidth={1.5} />
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0 text-right">
                        <div className="flex items-center justify-end gap-2 mb-0.5">
                          <span className="text-[11px] text-muted-foreground">
                            {isTerms ? "مصطلحات" : "وثائق"}
                          </span>
                          <span className={cn(
                            "text-xs font-bold px-2 py-0.5 rounded-md border",
                            isTerms
                              ? "bg-primary/10 border-primary/20 text-primary dark:bg-primary/20"
                              : "bg-orange-100 border-orange-200 text-orange-700 dark:bg-orange-900/30 dark:border-orange-800 dark:text-orange-400"
                          )}>
                            القسم {s.number}
                          </span>
                        </div>
                        <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {s.title}
                        </h3>
                      </div>

                      {/* Arrow */}
                      <ChevronLeft className={cn(
                        "h-5 w-5 flex-shrink-0 transition-all duration-300 group-hover:-translate-x-1",
                        isTerms ? "text-primary/50" : "text-orange-500/50"
                      )} />
                    </div>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}