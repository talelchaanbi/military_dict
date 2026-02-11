import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Shell } from "@/components/layout/Shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FileText, List } from "lucide-react";

export default async function SectionsIndexPage() {
  const sections = await prisma.section.findMany({
    orderBy: { number: "asc" },
    select: { number: true, title: true, type: true },
  });

  return (
    <Shell title="الأقسام" backTo="/">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => (
          <Link
            key={s.number}
            href={`/sections/${s.number}`}
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
            </Card>
          </Link>
        ))}
      </div>
    </Shell>
  );
}
