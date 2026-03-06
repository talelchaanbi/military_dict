"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
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
                  "group block",
                  "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 focus:ring-offset-background rounded-xl"
                )}
              >
                <motion.div
                  whileHover={{ y: -6, scale: 1.015 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className="h-full transform-gpu"
                >
                  <Card className={cn(
                    "h-full overflow-hidden border-border/40 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 relative",
                    "bg-gradient-to-b from-card to-card/50 hover:bg-card/80 group/card",
                    viewMode === "list" && "flex flex-row items-center p-3"
                  )}>
                    {viewMode === "grid" ? (
                      <div className="p-5 sm:p-6 flex flex-col h-full relative z-10 w-full">
                        {/* Decorative Background Blur */}
                        <div className={cn(
                          "absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full opacity-[0.03] dark:opacity-10 -z-10 transition-opacity duration-500 group-hover/card:opacity-[0.08] dark:group-hover/card:opacity-30",
                          isTerms ? "bg-primary" : "bg-orange-600"
                        )} />

                        <div className="flex items-start justify-between mb-auto">
                          <div className={cn(
                            "flex items-center justify-center p-3 w-12 h-12 rounded-2xl transition-all duration-500 shadow-sm border",
                            isTerms 
                                ? "bg-primary/5 text-primary border-primary/20 group-hover/card:scale-110 group-hover/card:-rotate-3 group-hover/card:bg-primary/10 group-hover/card:shadow-primary/20" 
                                : "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/10 dark:border-orange-800/50 dark:text-orange-400 group-hover/card:scale-110 group-hover/card:-rotate-3 group-hover/card:bg-orange-100 dark:group-hover/card:bg-orange-900/30 group-hover/card:shadow-orange-500/20"
                          )}>
                            <Icon className="h-6 w-6" strokeWidth={1.5} />
                          </div>
                          
                          <div className="flex flex-col items-end gap-1">
                            <span className={cn(
                              "text-xs font-bold px-3 py-1 rounded-full border shadow-sm backdrop-blur-md transition-colors",
                              isTerms 
                                ? "bg-primary/10 border-primary/20 text-primary dark:bg-primary/20"
                                : "bg-orange-100/50 border-orange-200 text-orange-700 dark:bg-orange-900/30 dark:border-orange-800 dark:text-orange-400"
                            )}>
                              القسم {s.number}
                            </span>
                            <span className="text-[10px] text-muted-foreground/70 font-medium px-2">
                              {isTerms ? "مصطلحات" : "وثائق"}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-8">
                            <CardTitle className="leading-relaxed text-lg font-bold group-hover/card:text-primary transition-colors text-right line-clamp-2">
                              {s.title}
                            </CardTitle>
                            
                            <div className="flex items-center justify-between mt-5 pt-4 border-t border-border/50">
                              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 opacity-80 group-hover/card:opacity-100 transition-opacity">
                                <BookOpen className="h-3.5 w-3.5" />
                                {isTerms ? "تصفح المصطلحات" : "قراءة الوثيقة"}
                              </span>
                              <ChevronLeft className="h-4 w-4 text-muted-foreground opacity-30 group-hover/card:opacity-100 group-hover/card:-translate-x-1 transition-all" />
                            </div>
                        </div>
                      </div>
                    ) : (
                      /* List View Layout */
                      <div className="flex items-center justify-between w-full px-2 py-1 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className={cn(
                              "h-12 w-12 rounded-xl flex items-center justify-center border shadow-sm transition-transform duration-500 group-hover/card:scale-105 group-hover/card:-rotate-3 group-hover/card:shadow-md",
                              isTerms 
                                ? "bg-primary/5 text-primary border-primary/20 group-hover/card:bg-primary/10 dark:bg-primary/20 dark:text-primary dark:border-primary/40"
                                : "bg-orange-50 text-orange-600 border-orange-100 group-hover/card:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800"
                            )}>
                              <Icon className="h-6 w-6" strokeWidth={1.5} />
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-muted/50 text-muted-foreground">القسم {s.number}</span>
                                  <span className="text-[10px] text-muted-foreground/70">{isTerms ? "مصطلحات" : "وثائق"}</span>
                                </div>
                                <h3 className="font-semibold text-base group-hover/card:text-primary transition-colors text-right line-clamp-1">{s.title}</h3>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <ChevronLeft className="h-5 w-5 text-muted-foreground opacity-40 group-hover/card:opacity-100 group-hover/card:-translate-x-1 transition-all duration-300" />
                        </div>
                      </div>
                    )}
                  </Card>
                </motion.div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}