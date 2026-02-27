"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Search, Crosshair, Radar, ShieldAlert, Terminal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const TRENDING_TERMS = ["استطلاع", "مناورة", "إمداد لوجستي", "عمليات خاصة", "دفاع جوي"];

export function ClientHome({ initialSearchQuery = "" }: { initialSearchQuery?: string }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [isFocused, setIsFocused] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!rootRef.current) return;
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      rootRef.current.style.setProperty("--spotlight-x", `${x}%`);
      rootRef.current.style.setProperty("--spotlight-y", `${y}%`);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div
      ref={rootRef}
      className="relative min-h-screen bg-background text-foreground overflow-hidden flex flex-col items-center justify-center selection:bg-primary/30"
      dir="rtl"
    >
      {/* 1. Tactical Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Animated Spotlight tracking mouse */}
        <div 
          className="absolute inset-0 z-0 opacity-40 transition-opacity duration-500"
          style={{
            background: `radial-gradient(600px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), rgba(var(--primary-rgb), 0.05), transparent 40%)`
          }}
        />
        
        {/* Tactical Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] opacity-20" />

        {/* Floating Tech Icons */}
        <motion.div animate={{ y: [-10, 10, -10], rotate: [0, 5, -5, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[15%] right-[10%] text-primary/10">
          <Radar size={120} />
        </motion.div>
        <motion.div animate={{ y: [10, -10, 10], rotate: [0, -10, 10, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-[20%] left-[10%] text-blue-500/10">
          <Crosshair size={100} />
        </motion.div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center w-full px-4 max-w-5xl space-y-12">
        
        {/* 2. LOGO SECTION */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative group"
        >
          <motion.div
            className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-blue-600/20 blur-2xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-500"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.img
            src="/logo.png"
            alt="شعار القاموس العسكري"
            className="relative h-40 md:h-56 w-auto object-contain drop-shadow-2xl z-10"
            whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
            transition={{
              scale: { type: "spring", stiffness: 300 },
              rotate: { duration: 0.35, ease: "easeInOut" },
            }}
          />
        </motion.div>

        {/* 3. TITLE & DESCRIPTION */}
        <div className="text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 border border-border/50 text-xs font-mono text-primary mb-2 shadow-sm backdrop-blur-sm"
          >
            <Terminal className="h-3 w-3" />
            <span>نظام البيانات الموحد - الإصدار 2.0</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-5xl md:text-7xl font-black font-cairo tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-foreground via-primary to-blue-600 pb-2 drop-shadow-sm"
          >
            القاموس العسكري الموحد
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed font-light"
          >
            المرجع الرقمي الشامل للمصطلحات والمفاهيم العسكرية الحديثة.
            <br className="hidden md:block" />
            <span className="font-medium text-foreground/80">دقة في المعلومة، وسرعة في الوصول.</span>
          </motion.p>
        </div>

        {/* 4. SEARCH CONSOLE */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="w-full max-w-2xl flex flex-col items-center gap-4"
        >
          <form onSubmit={handleSearch} className="w-full relative group">
            {/* Glowing border effect */}
            <div className={cn(
              "absolute -inset-0.5 bg-gradient-to-r from-primary to-blue-600 rounded-full blur opacity-20 transition-opacity duration-500",
              isFocused ? "opacity-60" : "group-hover:opacity-40"
            )} />
            
            <div className="relative flex items-center bg-card/90 backdrop-blur-xl border border-border/50 rounded-full shadow-2xl p-2 pl-2 pr-6 overflow-hidden">
              <Search className={cn(
                "h-6 w-6 transition-colors duration-300",
                isFocused ? "text-primary" : "text-muted-foreground"
              )} />
              
              <Input
                type="text"
                placeholder="أدخل المصطلح العسكري للبحث..."
                className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-lg h-14 placeholder:text-muted-foreground/50 pr-4"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
              
              <Button 
                type="submit" 
                size="lg" 
                className="rounded-full px-8 h-12 gap-2 text-md font-bold shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all duration-300"
              >
                تحليل
                <Crosshair className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {/* Quick Trending Tags */}
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground py-1.5 px-2 flex items-center gap-1">
              <ShieldAlert className="h-3 w-3" />
              الأكثر بحثاً:
            </span>
            {TRENDING_TERMS.map((term, i) => (
              <motion.button
                key={term}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + (i * 0.1) }}
                onClick={() => setSearchQuery(term)}
                className="text-xs font-medium px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50 text-secondary-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all cursor-pointer"
              >
                {term}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* 5. EXPLORE BUTTON */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="pt-8"
        >
          <Link href="/sections">
            <Button size="lg" variant="ghost" className="h-14 px-8 text-lg gap-3 rounded-full border-2 border-transparent hover:bg-secondary/20 hover:border-primary/20 group transition-all">
              <BookOpen className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              استعراض قاعدة البيانات
            </Button>
          </Link>
        </motion.div>

      </div>
    </div>
  );
}