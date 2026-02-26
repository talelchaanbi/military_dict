import { prisma } from "@/lib/prisma";
import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q: string }>;
}) {
  const { q } = await searchParams;
  const query = q || "";

  let terms: any[] = [];

  if (query) {
        terms = await prisma.term.findMany({
            where: {
                OR: [{ term: { contains: query } }, { description: { contains: query } }],
            },
            include: {
                section: true,
            },
            take: 20,
        });
  }

    const hasResults = terms.length > 0;

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
        {/* Reuse Background Gradients for consistency */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: "10s" }}></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: "15s" }}></div>
        </div>

      <Shell>
        <div className="container mx-auto py-8">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Search className="h-8 w-8 text-primary" />
                    <span>نتائج البحث: <span className="text-primary">"{query}"</span></span>
                </h1>
            </div>

            {!hasResults ? (
            <div className="text-center py-12 text-muted-foreground">
                <div className="mb-4">
                  <Search className="h-16 w-16 mx-auto opacity-20" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {query ? "لم يتم العثور على نتائج" : "ابدأ البحث"}
                </h3>
                <p>
                  {query ? "جرب البحث بكلمات مختلفة أو أكثر عمومية." : "أدخل كلمات البحث في الصفحة الرئيسية للعثور على المصطلحات."}
                </p>
                {!query && (
                  <Link href="/">
                    <Button className="mt-6" variant="outline">
                      العودة للرئيسية
                    </Button>
                  </Link>
                )}
            </div>
            ) : (
            <div className="space-y-8">
                {/* Terms Results */}
                {terms.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-semibold flex items-center gap-2">
                            مصطلحات ({terms.length})
                        </h2>
                        <div className="grid gap-6">
                            {terms.map((term) => (
                            <Card key={term.id} className="hover:shadow-md transition-shadow group">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start gap-4">
                                        <CardTitle className="text-xl font-bold text-primary group-hover:text-blue-600 transition-colors">
                                            {term.term}
                                        </CardTitle>
                                        {term.section && (
                                            <span className="text-xs font-medium bg-secondary px-2 py-1 rounded-md text-muted-foreground whitespace-nowrap">
                                                {term.section.title}
                                            </span>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
                                        {term.description || "لا يوجد وصف متاح."}
                                    </p>
                                    <div className="flex justify-end pt-2 border-t border-border/50">
                                        <Link href={`/sections/${term.section?.number}?term=${term.id}#term-${term.id}`}>
                                            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/10 -mr-3">
                                                عرض التفاصيل
                                                <ArrowLeft className="h-4 w-4 mr-2" />
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                            ))}
                        </div>
                    </div>
                )}

            </div>
            )}
        </div>
      </Shell>
    </div>
  );
}
