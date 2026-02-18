import { prisma } from "@/lib/prisma";
import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Search, FileText } from "lucide-react";
import sanitizeHtml from 'sanitize-html';

function stripHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [],
    allowedAttributes: {},
  });
}

function getSnippet(text: string, query: string, length = 150) {
    if (!text) return "";
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);
    
    if (index === -1) return text.substring(0, length) + "...";
    
    const start = Math.max(0, index - 50);
    const end = Math.min(text.length, index + query.length + 100);
    
    return (start > 0 ? "..." : "") + text.substring(start, end) + (end < text.length ? "..." : "");
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q: string }>;
}) {
  const { q } = await searchParams;
  const query = q || "";

  let terms: any[] = [];
  let documents: any[] = [];

  if (query) {
    const [termsResult, documentsResult] = await Promise.all([
        prisma.term.findMany({
            where: {
            OR: [
                { term: { contains: query } },
                { description: { contains: query } },
            ],
            },
            include: {
            section: true,
            },
            take: 20,
        }),
        prisma.document.findMany({
            where: {
                contentHtml: { contains: query },
                section: {
                    number: { in: [12, 13] } // Assuming section numbers are literally 12 and 13. Adjust if needed.
                }
            },
            include: {
                section: true
            },
            take: 10
        })
    ]);
    terms = termsResult;
    documents = documentsResult;
  }

  const hasResults = terms.length > 0 || documents.length > 0;

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
                                        <Link href={`/sections/${term.section?.number}?term=${term.id}`}>
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

                {/* Documents Results */}
                {documents.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-semibold flex items-center gap-2 mt-8 border-t pt-8">
                            <FileText className="h-6 w-6" />
                            مستندات ({documents.length})
                        </h2>
                        <div className="grid gap-6">
                            {documents.map((doc) => {
                                const plainText = stripHtml(doc.contentHtml || "");
                                const snippet = getSnippet(plainText, query);
                                return (
                                <Card key={doc.id} className="hover:shadow-md transition-shadow group">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start gap-4">
                                            <CardTitle className="text-xl font-bold text-primary group-hover:text-blue-600 transition-colors">
                                                {doc.title || doc.code}
                                            </CardTitle>
                                            {doc.section && (
                                                <span className="text-xs font-medium bg-secondary px-2 py-1 rounded-md text-muted-foreground whitespace-nowrap">
                                                    {doc.section.title}
                                                </span>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground line-clamp-3 mb-4 leading-relaxed font-mono text-sm">
                                            {snippet}
                                        </p>
                                        <div className="flex justify-end pt-2 border-t border-border/50">
                                            <Link href={`/viewer/${doc.code}?q=${encodeURIComponent(query)}`}>
                                                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/10 -mr-3">
                                                    عرض المستند
                                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            )})}
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
