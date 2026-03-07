"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Search, Layout, FileText, Users, Shield,
  ChevronDown, ChevronLeft, Play, Download, Printer,
  Star, Info, CheckCircle2, AlertCircle, Lightbulb,
  LogIn, Layers, Eye, PenSquare, Settings, HelpCircle,
  BookMarked, Hash, Table2, Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// ─── Data ─────────────────────────────────────────────────────────────────────

const SECTIONS = [
  {
    id: "intro",
    icon: BookMarked,
    color: "text-primary",
    bg: "bg-primary/10 border-primary/20",
    title: "مقدمة عن النظام",
    badge: "أولاً",
    steps: [
      {
        title: "ما هو القاموس العسكري الموحد؟",
        content: `القاموس العسكري الموحد هو نظام رقمي متكامل يضم آلاف المصطلحات والمفاهيم العسكرية الحديثة، مقسمة إلى أقسام تخصصية تشمل التنظيم والإمداد والعمليات والوثائق الميدانية.`,
        tip: "يمكن الوصول إلى النظام من أي جهاز (حاسوب، لوحي، هاتف) عبر المتصفح.",
        screenshot: null,
      },
      {
        title: "واجهة النظام الرئيسية",
        content: `تتكون واجهة النظام من: شريط التنقل العلوي (الأقسام، تسجيل الدخول)، الصفحة الرئيسية مع بحث فوري، وصفحات مفصلة لكل قسم.`,
        tip: "يدعم النظام الوضع الليلي (Dark Mode) — انقر على أيقونة الشمس/القمر في الشريط العلوي.",
        screenshot: "/guide/screenshots/home.png",
      },
    ],
  },
  {
    id: "login",
    icon: LogIn,
    color: "text-blue-500",
    bg: "bg-blue-500/10 border-blue-500/20",
    title: "تسجيل الدخول",
    badge: "ثانياً",
    steps: [
      {
        title: "كيفية تسجيل الدخول",
        content: `انقر على زر "تسجيل الدخول" في أعلى يمين الصفحة، أدخل اسم المستخدم وكلمة المرور الممنوحة لك من المدير، ثم انقر "دخول".`,
        tip: "في حال نسيت كلمة المرور، تواصل مع مدير النظام لإعادة تعيينها.",
        screenshot: "/guide/screenshots/login.png",
      },
      {
        title: "مستويات الصلاحية",
        content: `يوجد 3 مستويات: \n• مستخدم: عرض المصطلحات وتقديم مقترحات.\n• معالج البيانات: إضافة وتعديل المصطلحات والبت في المقترحات.\n• مدير النظام: إدارة المستخدمين وجميع الصلاحيات.`,
        tip: "ستجد صلاحيتك مكتوبة أسفل اسمك في الشريط العلوي.",
        screenshot: "/guide/screenshots/roles.png",
      },
    ],
  },
  {
    id: "search",
    icon: Search,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    title: "البحث عن المصطلحات",
    badge: "ثالثاً",
    steps: [
      {
        title: "البحث الفوري من الصفحة الرئيسية",
        content: `في الصفحة الرئيسية، اكتب المصطلح المراد في حقل البحث ثم انقر "تحليل" أو اضغط Enter. ستنتقل تلقائياً إلى صفحة نتائج البحث الشاملة.`,
        tip: "يمكنك النقر على أحد المصطلحات المقترحة (الأكثر بحثاً) لبدء البحث فوراً.",
        screenshot: "/guide/screenshots/search-home.png",
      },
      {
        title: "فهم نتائج البحث",
        content: `تظهر النتائج مع: اسم المصطلح، القسم الذي ينتمي إليه، الاختصار إن وجد، والوصف التفصيلي. يمكن النقر على أي نتيجة للانتقال مباشرة إلى موضعها في قسمها.`,
        tip: "البحث يشمل المصطلح والاختصار والوصف في آنٍ واحد.",
        screenshot: "/guide/screenshots/search-results.png",
      },
    ],
  },
  {
    id: "sections",
    icon: Layers,
    color: "text-orange-500",
    bg: "bg-orange-500/10 border-orange-500/20",
    title: "تصفح الأقسام",
    badge: "رابعاً",
    steps: [
      {
        title: "صفحة الأقسام",
        content: `انقر على "الأقسام" في شريط التنقل للوصول إلى قائمة جميع الأقسام. يمكنك التبديل بين العرض الشبكي (بطاقات) والعرض القائمة، والبحث والتصفية حسب النوع.`,
        tip: "الأقسام ذات الشريط البرتقالي هي وثائق ميدانية، والأزرق/الرمادي هي مصطلحات.",
        screenshot: "/guide/screenshots/sections.png",
      },
      {
        title: "داخل القسم: عرض المصطلحات",
        content: `بعد فتح أي قسم، ستجد جدولاً بجميع مصطلحاته مقسمة حسب العناوين الفرعية. يوجد شريط جانبي يسار وشريط بحث داخلي، إضافة إلى إمكانية تحديد وطباعة مصطلحات بعينها.`,
        tip: "يمكنك تحديد صف للحصول على خيارات إضافية مثل الطباعة أو تقديم مقترح اختصار.",
        screenshot: "/guide/screenshots/section-detail.png",
      },
      {
        title: "الطباعة وتصدير البيانات",
        content: `في صفحة القسم، انقر على زر "طباعة" لطباعة المصطلحات المحددة أو جميع مصطلحات القسم. يمكن أيضاً تصدير البيانات بصيغة CSV للاستخدام في Excel.`,
        tip: "حدد المصطلحات التي تريدها أولاً بالنقر على المربعات، ثم انقر طباعة للحصول على تقرير مخصص.",
        screenshot: "/guide/screenshots/print.png",
      },
    ],
  },
  {
    id: "viewer",
    icon: Eye,
    color: "text-purple-500",
    bg: "bg-purple-500/10 border-purple-500/20",
    title: "عارض الوثائق",
    badge: "خامساً",
    steps: [
      {
        title: "فتح الوثائق الميدانية",
        content: `بعض الأقسام تحتوي على وثائق HTML تفاعلية (مثل الخرائط والمخططات). انقر على "قراءة الوثيقة" في بطاقة القسم للوصول إلى العارض المدمج.`,
        tip: "يمكن تكبير الصور داخل الوثائق بالنقر عليها.",
        screenshot: "/guide/screenshots/viewer.png",
      },
    ],
  },
  {
    id: "proposals",
    icon: PenSquare,
    color: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/20",
    title: "تقديم مقترح اختصار",
    badge: "سادساً",
    steps: [
      {
        title: "كيفية تقديم مقترح",
        content: `في صفحة القسم، حدد المصطلح الذي تريد اقتراح اختصار له، ثم انقر على أيقونة المقترح. أدخل الاختصار المقترح والمبرر، ثم أرسله.`,
        tip: "يجب تسجيل الدخول لتقديم المقترحات. تتابع حالة مقترحاتك من قسم المقترحات.",
        screenshot: "/guide/screenshots/proposal.png",
      },
      {
        title: "متابعة المقترحات",
        content: `انتقل إلى "مقترح جديد" من القائمة لرؤية حالة مقترحاتك: في الانتظار / مقبول / مرفوض، مع ملاحظات المعالج.`,
        tip: "المقترحات المقبولة تُضاف تلقائياً لقاموس الاختصارات.",
        screenshot: "/guide/screenshots/proposals-list.png",
      },
    ],
  },
  {
    id: "admin",
    icon: Settings,
    color: "text-red-500",
    bg: "bg-red-500/10 border-red-500/20",
    title: "إدارة النظام (للمدير)",
    badge: "سابعاً",
    steps: [
      {
        title: "إدارة المستخدمين",
        content: `من قائمة "المستخدمون"، يمكن للمدير: إضافة حسابات جديدة، تعديل الصلاحيات، تعطيل أو تفعيل الحسابات، وأرشفة الحسابات غير النشطة مع إمكانية استعادتها.`,
        tip: "لا يمكن أرشفة حساب المدير الحالي لتفادي قفل النظام.",
        screenshot: "/guide/screenshots/admin-users.png",
      },
      {
        title: "متابعة حالة المستخدمين",
        content: `يظهر في جدول المستخدمين: النقطة الخضراء للمتصلين حالياً (آخر 10 دقائق)، آخر وقت اتصال، وحالة الحساب (مفعّل/معطّل).`,
        tip: "يُحدَّث وقت الاتصال تلقائياً عند كل تسجيل دخول ناجح.",
        screenshot: "/guide/screenshots/admin-status.png",
      },
    ],
  },
];

// ─── Step Card ────────────────────────────────────────────────────────────────

function StepCard({
  step,
  index,
  color,
}: {
  step: (typeof SECTIONS)[0]["steps"][0];
  index: number;
  color: string;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="rounded-xl border bg-card shadow-sm overflow-hidden"
    >
      {/* Screenshot area */}
      <div className="relative w-full bg-muted/30 border-b border-border/50">
        {step.screenshot && !imgError ? (
          <img
            src={step.screenshot}
            alt={step.title}
            className="w-full h-auto object-cover max-h-72"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground/40 gap-3">
            <Layout className="h-10 w-10" />
            <span className="text-xs font-mono">لقطة الشاشة قيد الإضافة</span>
          </div>
        )}
        {/* Step number badge */}
        <div className={cn(
          "absolute top-3 right-3 h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border shadow-sm",
          "bg-card", color
        )}>
          {index + 1}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-bold text-foreground text-base">{step.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
          {step.content}
        </p>
        {step.tip && (
          <div className="flex items-start gap-2 bg-amber-500/8 border border-amber-500/20 rounded-lg px-3 py-2.5">
            <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">{step.tip}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Section Block ─────────────────────────────────────────────────────────────

function SectionBlock({ section }: { section: (typeof SECTIONS)[0] }) {
  const [open, setOpen] = useState(true);
  const Icon = section.icon;

  return (
    <div id={section.id} className="scroll-mt-28">
      {/* Section header — clickable accordion */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 text-right group mb-4"
      >
        <div className={cn(
          "h-10 w-10 rounded-xl flex items-center justify-center border shrink-0",
          section.bg, section.color
        )}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 text-right">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">{section.badge}</span>
            <h2 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
              {section.title}
            </h2>
          </div>
        </div>
        <ChevronDown className={cn(
          "h-5 w-5 text-muted-foreground transition-transform duration-300 shrink-0",
          open ? "rotate-180" : ""
        )} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pb-2">
              {section.steps.map((step, i) => (
                <StepCard key={i} step={step} index={i} color={section.color} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="border-b border-border/40 my-6" />
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function GuideClient() {
  const [activeId, setActiveId] = useState<string | null>(null);

  function scrollTo(id: string) {
    setActiveId(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="flex gap-8 animate-in fade-in duration-500" dir="rtl">

      {/* ── Sticky sidebar TOC ── */}
      <aside className="hidden xl:block w-56 shrink-0">
        <div className="sticky top-28 space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase px-2 mb-3 tracking-wider">
            المحتويات
          </p>
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-right transition-all",
                  activeId === s.id
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon className={cn("h-3.5 w-3.5 shrink-0", s.color)} />
                <span className="truncate">{s.title}</span>
              </button>
            );
          })}

          {/* Download tip */}
          <div className="mt-6 p-3 rounded-xl bg-muted/40 border border-border/50 space-y-2">
            <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 shrink-0" />
              إضافة لقطات الشاشة
            </p>
            <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
              ضع ملفات PNG في:
              <code className="block mt-1 bg-background border border-border/60 rounded px-2 py-1 font-mono text-[9px] break-all">
                public/guide/screenshots/
              </code>
            </p>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 min-w-0 space-y-2">

        {/* Hero banner */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border bg-linear-to-br from-primary/5 via-card to-primary/5 p-6 mb-8 flex flex-col sm:flex-row items-center gap-5"
        >
          <div className="h-16 w-16 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center text-primary shrink-0 shadow-lg">
            <BookOpen className="h-8 w-8" />
          </div>
          <div className="text-center sm:text-right">
            <h1 className="text-2xl font-black text-foreground mb-1">
              دليل الاستخدام الشامل
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xl">
              هذا الدليل يشرح بالتفصيل جميع وظائف وميزات القاموس العسكري الموحد مع لقطات الشاشة التوضيحية.
            </p>
            <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
              <span className="inline-flex items-center gap-1 text-xs bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2.5 py-1 rounded-full font-medium">
                <CheckCircle2 className="h-3 w-3" />
                {SECTIONS.length} أقسام
              </span>
              <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-full font-medium">
                <Hash className="h-3 w-3" />
                {SECTIONS.reduce((a, s) => a + s.steps.length, 0)} خطوة توضيحية
              </span>
            </div>
          </div>
        </motion.div>

        {/* Quick nav pills (mobile) */}
        <div className="xl:hidden flex gap-2 flex-wrap mb-6">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                  s.bg, s.color
                )}
              >
                <Icon className="h-3 w-3" />
                {s.title}
              </button>
            );
          })}
        </div>

        {/* Sections */}
        {SECTIONS.map((section) => (
          <SectionBlock key={section.id} section={section} />
        ))}

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="rounded-xl border border-primary/20 bg-primary/5 p-5 flex gap-3 items-start mt-4"
        >
          <HelpCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-foreground text-sm mb-1">تحتاج مساعدة؟</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              في حال واجهتك أي صعوبة في استخدام النظام، تواصل مع مدير النظام أو راجع الفيديو التعريفي عبر زر{" "}
              <span className="text-primary font-semibold">دليل الاستخدام</span> في أسفل الشاشة.
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
