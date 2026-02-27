"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock, User, ArrowRight, Loader2, FileEdit, Book, SearchX } from "lucide-react";
import { cn } from "@/lib/utils";

type Proposal = {
  id: number;
  proposedAbbreviation: string;
  createdAt: string;
  term: { 
    id: number; 
    term: string; 
    abbreviation: string | null;
    section: { id: number; title: string; number: number };
  };
  createdBy: { id: number; username: string };
};

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "الآن";
  if (diffInSeconds < 3600) return `منذ ${Math.floor(diffInSeconds / 60)} دقيقة`;
  if (diffInSeconds < 86400) return `منذ ${Math.floor(diffInSeconds / 3600)} ساعة`;
  return `منذ ${Math.floor(diffInSeconds / 86400)} يوم`;
}

export default function ProposalsClient() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  async function load() {
    try {
      setLoading(true);
      const res = await fetch("/api/editor/proposals");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setProposals(data.proposals || []);
    } catch (error) {
      console.error("Failed to load proposals", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function act(id: number, action: "approve" | "reject") {
    if (processingId) return;
    setProcessingId(id);
    try {
      await fetch(`/api/editor/proposals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      // Optimistic update
      setProposals(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error("Action failed", error);
    } finally {
      setProcessingId(null);
    }
  }

  if (loading && proposals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-muted-foreground gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary/50" />
        <p className="text-lg font-medium animate-pulse">جاري تحميل المقترحات...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* Header Stat */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          عدد المقترحات المعلقة: <span className="font-bold text-foreground">{proposals.length}</span>
        </div>
        <Button size="sm" variant="ghost" onClick={load} disabled={loading} className="text-muted-foreground hover:text-foreground">
           تحديث القائمة
        </Button>
      </div>

      {proposals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-muted/10 border border-dashed rounded-xl text-center">
          <div className="bg-muted/50 p-6 rounded-full mb-6">
            <Check className="h-12 w-12 text-green-600/50" />
          </div>
          <h3 className="text-2xl font-bold mb-3">لا توجد مقترحات معلقة</h3>
          <p className="text-muted-foreground max-w-sm mb-8">
            جميع المقترحات تمت مراجعتها من قبل المحررين. ستظهر أي مقترحات جديدة هنا فور إضافتها.
          </p>
          <Button onClick={load} variant="outline" className="gap-2">
            <SearchX className="h-4 w-4" />
            تحقق مرة أخرى
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {proposals.map((p) => {
            const isProcessing = processingId === p.id;
            
            return (
            <Card key={p.id} className={cn(
              "group overflow-hidden transition-all hover:shadow-lg hover:border-primary/20 bg-card border-muted-foreground/15",
              isProcessing && "opacity-50 pointer-events-none scale-[0.98] grayscale"
            )}>
              <CardHeader className="bg-muted/20 pb-4 border-b border-border/40 relative">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-sm ring-2 ring-background">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-foreground/90">{p.createdBy.username}</div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                        <Badge variant="secondary" className="px-1.5 h-5 font-normal bg-background/50 hover:bg-background">
                            <Clock className="h-3 w-3 ml-1" />
                            {formatRelativeTime(p.createdAt)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="outline" className="bg-background/80 backdrop-blur font-medium border-blue-200 text-blue-700 shadow-sm">
                      <FileEdit className="h-3 w-3 ml-1.5" />
                      اقتراح تعديل
                    </Badge>
                    <Badge variant="outline" className="bg-background/50 text-muted-foreground font-normal">
                      <Book className="h-3 w-3 ml-1.5" />
                      الفصل {p.term.section.number}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-6 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">المصطلح الأصلي</span>
                      <span className="text-[10px] text-muted-foreground/50">ID: {p.term.id}</span>
                  </div>
                  <div className="p-3 bg-muted/10 rounded-lg border border-border/30">
                     <h3 className="text-lg md:text-xl font-bold leading-tight text-right dir-rtl" dir="rtl">{p.term.term}</h3>
                  </div>
                </div>

                <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-2 md:gap-4">
                  {/* Current */}
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground font-medium text-center">الاختصار الحالي</div>
                    <div className={cn(
                        "relative flex items-center justify-center min-h-[48px] rounded-md border text-lg font-mono font-bold transition-colors",
                        p.term.abbreviation ? "bg-muted/10 border-border text-foreground" : "bg-muted/5 border-dashed border-muted text-muted-foreground/50"
                    )}>
                      {p.term.abbreviation || <span className="text-sm">لا يوجد</span>}
                    </div>
                  </div>
                  
                  {/* Arrow */}
                  <div className="flex flex-col items-center justify-center pt-6 text-muted-foreground/40">
                    <ArrowRight className="h-6 w-6 rotate-180" />
                  </div>

                  {/* New */}
                  <div className="space-y-2">
                    <div className="text-xs text-primary font-medium text-center">المقترح الجديد</div>
                    <div className="relative flex items-center justify-center min-h-[48px] rounded-md border border-primary/30 bg-primary/5 text-lg font-mono font-bold text-primary shadow-sm ring-2 ring-transparent group-hover:ring-primary/10 transition-all">
                      {p.proposedAbbreviation}
                      <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full shadow-sm font-bold animate-pulse">
                        جديد
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="grid grid-cols-2 gap-3 pt-2 pb-6 px-6 bg-gradient-to-t from-muted/5 to-transparent">
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow hover:-translate-y-0.5 transition-all active:scale-95" 
                  onClick={() => act(p.id, "approve")}
                  disabled={isProcessing}
                >
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Check className="h-4 w-4 ml-2" />}
                  قبول واعتماد
                </Button>
                <Button 
                  variant="outline" 
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 hover:shadow-sm hover:-translate-y-0.5 transition-all active:scale-95" 
                  onClick={() => act(p.id, "reject")}
                  disabled={isProcessing}
                >
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <X className="h-4 w-4 ml-2" />}
                  رفض وتجاهل
                </Button>
              </CardFooter>
            </Card>
          )})}
        </div>
      )}
    </div>
  );
}
