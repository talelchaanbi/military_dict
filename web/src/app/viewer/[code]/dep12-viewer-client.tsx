"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Search, FileText, Map as MapIcon, Sparkles, ChevronLeft, Zap, Layers, Anchor, Rocket, Target, Flag, Shield, Plane } from "lucide-react";

export type Dep12DocItem = {
  code: string;
  title: string;
  description?: string;
  kind: "sections" | "visuals";
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, duration: 0.3 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 200, damping: 20 } },
};

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
    <div className="min-h-[80vh] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent -m-4 p-4 md:-m-12 md:p-12 transition-colors duration-1000">
      
      <div className="max-w-full mx-auto space-y-12">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <motion.div 
            initial={{ x: 20, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="space-y-3"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-bold tracking-widest text-xs uppercase shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span>مستكشف دليل الذخيرة والوثائق</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-l from-foreground to-foreground/70 tracking-tight leading-tight">
              {title}
            </h1>
          </motion.div>

          {/* Search Bar */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="relative group w-full md:w-96"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-blue-500/30 rounded-2xl blur-md opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
            <div className="relative bg-background/80 backdrop-blur-xl rounded-xl border border-border/50 flex items-center px-4 shadow-sm hover:shadow-md transition-all h-14">
              <Search className="h-5 w-5 text-muted-foreground mr-2 group-focus-within:text-primary transition-colors" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث: قسم، خريطة، مصطلح..."
                className="border-0 focus-visible:ring-0 bg-transparent h-full text-base"
              />
            </div>
          </motion.div>
        </header>

        {/* Content Lists */}
        <div className="space-y-12">
          {sections.length > 0 && (
            <SectionBlock title="أقسام الدليل" icon={Layers} items={sections} delay={0.2} />
          )}

          {visuals.length > 0 && (
            <SectionBlock title="الخرائط والملحقات" icon={MapIcon} items={visuals} delay={0.4} />
          )}

          {/* Empty State */}
          <AnimatePresence>
            {filtered.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="py-24 text-center border-2 border-dashed border-border rounded-3xl bg-card/30 backdrop-blur-sm"
              >
                <motion.div
                  animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                >
                  <Search className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6 drop-shadow-sm" />
                </motion.div>
                <h3 className="text-xl font-bold text-foreground mb-2">لا توجد نتائج مطابقة</h3>
                <p className="text-muted-foreground">حاول البحث باستخدام كلمات مفتاحية مختلفة..</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function SectionBlock({
  title,
  icon: Icon,
  items,
  delay
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: Dep12DocItem[];
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-primary/10 rounded-xl text-primary shadow-sm border border-primary/10">
          <Icon className="h-5 w-5" />
        </div>
        <h2 className="text-2xl font-bold text-foreground tracking-tight">{title}</h2>
        <div className="h-px bg-gradient-to-l from-border/50 to-transparent flex-1 ml-4" />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 md:grid-cols-2"
      >
        {items.map((item) => (
          <DocListItem key={item.code} item={item} />
        ))}
      </motion.div>
    </motion.div>
  );
}

const getDynamicIcon = (title: string, kind: string) => {
  const t = title.toLowerCase();
  if (t.includes('بحر')) return Anchor;
  if (t.includes('جو')) return Plane;
  if (t.includes('فضاء')) return Rocket;
  if (t.includes('برية')) return Target;
  if (t.includes('قيادة') || t.includes('سيطرة')) return Flag;
  if (t.includes('خريط') || t.includes('خرائط')) return MapIcon;
  if (t.includes('شفاف')) return Layers;
  
  return kind === "visuals" ? MapIcon : FileText;
};

function DocListItem({ item }: { item: Dep12DocItem }) {
  const isVisual = item.kind === "visuals";
  const ItemIcon = getDynamicIcon(item.title, item.kind);
  const href = `/uploads/docs/${encodeURIComponent(item.code)}.html`;

  return (
    <motion.div variants={itemVariants} whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}>
      <Link 
        href={href} 
        className="group relative flex items-stretch h-full bg-card hover:bg-card border border-border/60 hover:border-primary/40 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/5 overflow-hidden"
      >
        {/* Interactive Gradient Background on Hover */}
        <div className={`absolute inset-0 bg-gradient-to-l ${isVisual ? 'from-blue-500/5 to-transparent' : 'from-primary/5 to-transparent'} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
        
        {/* Accent Bar */}
        <div className={`w-1.5 shrink-0 ${isVisual ? 'bg-blue-500' : 'bg-primary'} opacity-50 group-hover:opacity-100 transition-opacity duration-300`} />

        <div className="flex-1 p-5 flex items-center justify-between gap-4 relative z-10 z-10 backdrop-blur-[2px]">
          
          <div className="flex items-center gap-5">
            <div className={`shrink-0 p-4 rounded-2xl ${isVisual ? 'bg-blue-500/10 text-blue-600' : 'bg-primary/10 text-primary'} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 ease-out border border-transparent group-hover:border-current/20`}>
              <ItemIcon className="h-6 w-6 stroke-[1.5]" />
            </div>
            
            <div className="space-y-1.5">
              <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors duration-300">
                {item.title}
              </h3>
              {item.description && (
                <p className="text-sm text-muted-foreground/80 group-hover:text-muted-foreground transition-colors duration-300 line-clamp-1">
                  {item.description}
                </p>
              )}
            </div>
          </div>
          
          <div className="shrink-0 w-10 h-10 rounded-full bg-background border border-border shadow-sm flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:border-primary group-hover:text-primary-foreground group-hover:-translate-x-2 transition-all duration-300">
            <ChevronLeft className="w-5 h-5 pointer-events-none" />
          </div>
          
        </div>
      </Link>
    </motion.div>
  );
}
