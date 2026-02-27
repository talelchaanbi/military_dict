"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Check, X, Clock, User, ArrowRight, Loader2, FileEdit, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Proposal = {
  id: number;
  proposedAbbreviation: string;
  createdAt: string;
  term: { id: number; term: string; abbreviation: string | null };
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
      const data = await res.json();
      if (res.ok) setProposals(data.proposals || []);
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
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary/50" />
        <p>جاري تحميل المقترحات...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {proposals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-muted/30 border border-dashed rounded-xl text-center">
          <div className="bg-muted p-4 rounded-full mb-4">
            <Check className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-semibold mb-2">لا توجد مقترحات معلقة</h3>
          <p className="text-muted-foreground max-w-sm">
            جميع المقترحات تمت مراجعتها via المستخدمين. ستظهر أي مقترحات جديدة هنا.
          </p>
          <Button onClick={load} variant="outline" className="mt-6">
            تحديث القائمة
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {proposals.map((p) => {
            const isProcessing = processingId === p.id;
            
            return (
            <Card key={p.id} className={cn(
              "overflow-hidden transition-all hover:shadow-md border-muted-foreground/20",
              isProcessing && "opacity-50 pointer-events-none"
            )}>
              <CardHeader className="bg-muted/30 pb-4 border-b border-border/50">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-sm">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{p.createdBy.username}</div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatRelativeTime(p.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="bg-background border rounded-full px-3 py-1 text-xs font-medium shadow-sm flex items-center gap-1.5">
                    <FileEdit className="h-3.5 w-3.5 text-blue-500" />
                    اقتراح تعديل
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-6 space-y-6">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">المصطلح الأصلي</div>
                  <h3 className="text-lg font-bold leading-tight" dir="rtl">{p.term.term}</h3>
                </div>

                <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-4 bg-muted/20 p-4 rounded-lg border border-border/50">
                  <div className="text-center space-y-1">
                    <div className="text-xs text-muted-foreground font-medium">الاختصار الحالي</div>
                    <div className="font-mono text-lg font-bold bg-background py-1 px-2 rounded border border-dashed min-h-[36px] flex items-center justify-center text-muted-foreground">
                      {p.term.abbreviation || "—"}
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <ArrowRight className="h-5 w-5 text-muted-foreground/50 rotate-180" />
                  </div>

                  <div className="text-center space-y-1">
                    <div className="text-xs text-primary font-medium">المقترح الجديد</div>
                    <div className="font-mono text-lg font-bold bg-primary/10 text-primary py-1 px-2 rounded border border-primary/20 min-h-[36px] flex items-center justify-center shadow-sm">
                      {p.proposedAbbreviation}
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex gap-3 pt-2 pb-6 px-6 bg-gradient-to-t from-muted/10 to-transparent">
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700 shadow-sm hover:shadow text-white gap-2" 
                  onClick={() => act(p.id, "approve")}
                  disabled={isProcessing}
                >
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  موافقة واعتماد
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 gap-2" 
                  onClick={() => act(p.id, "reject")}
                  disabled={isProcessing}
                >
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                  رفض المقترح
                </Button>
              </CardFooter>
            </Card>
          )})}
        </div>
      )}
    </div>
  );
}
