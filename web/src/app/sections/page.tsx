import Link from "next/link";
import { prisma } from "@/lib/prisma";
<<<<<<< HEAD
import { Shell } from "@/components/Shell";
=======
import { Shell } from "@/components/layout/Shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // We will create this
import { FileText, List } from "lucide-react";
>>>>>>> main

export default async function SectionsIndexPage() {
  const sections = await prisma.section.findMany({
    orderBy: { number: "asc" },
    select: { number: true, title: true, type: true },
  });

  return (
<<<<<<< HEAD
    <Shell title="الأقسام">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
=======
    <Shell title="الأقسام" backTo="/">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
>>>>>>> main
        {sections.map((s) => (
          <Link
            key={s.number}
            href={`/sections/${s.number}`}
<<<<<<< HEAD
            className="rounded-lg border border-zinc-200 bg-white p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          >
            <div className="text-sm text-zinc-500">قسم {s.number}</div>
            <div className="mt-1 font-semibold">{s.title}</div>
            <div className="mt-2 text-xs text-zinc-500">
              {s.type === "terms" ? "مصطلحات" : "وثائق"}
            </div>
=======
            className="block h-full"
          >
            <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
              <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                     <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded-md">
                        قسم {s.number}
                     </span>
                     {s.type === "terms" ? (
                         <List className="h-5 w-5 text-muted-foreground" />
                     ) : (
                         <FileText className="h-5 w-5 text-muted-foreground" />
                     )}
                  </div>
                 <CardTitle className="leading-snug text-lg">{s.title}</CardTitle>
              </CardHeader>
              <CardContent>
                 <CardDescription>
                    {s.type === "terms" ? "بحث في المصطلحات والتعاريف" : "استعراض الوثائق والرموز"}
                 </CardDescription>
              </CardContent>
            </Card>
>>>>>>> main
          </Link>
        ))}
      </div>
    </Shell>
  );
}
