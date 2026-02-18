import { prisma } from "@/lib/prisma";
import { Shell } from "@/components/layout/Shell";
import { SectionsClient } from "./sections-client";

export default async function SectionsIndexPage() {
  const sections = await prisma.section.findMany({
    where: {
      NOT: {
        number: {
          gte: 1301,
          lte: 1399
        }
      }
    },
    orderBy: { number: "asc" },
    select: { number: true, title: true, type: true },
  });

  return (
    <Shell backTo="/">
      <div className="flex flex-col space-y-2 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
          الأقسام والمراجع
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          تصفح جميع أقسام القاموس العسكري والمراجع الفنية. يمكنك البحث والتصفية للوصول السريع للمعلومة.
        </p>
      </div>
      <SectionsClient sections={sections} />
    </Shell>
  );
}
