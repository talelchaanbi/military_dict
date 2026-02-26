"use client";

import { useState } from "react";
import { X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type TermProps = {
  id: number;
  term: string;
  abbreviation?: string | null;
  description?: string | null;
};

export function ProposalModal({ term }: { term: TermProps }) {
  const [isOpen, setIsOpen] = useState(false);
  const [proposed, setProposed] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => {
    setIsOpen(false);
    setProposed("");
    setError(null);
    setSuccess(false);
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!proposed.trim()) return;

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          termId: term.id, 
          proposedAbbreviation: proposed.trim() 
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "فشل إرسال الاقتراح");
      }

      setSuccess(true);
      setTimeout(() => {
        closeModal();
      }, 2000);
    } catch (err: any) {
        setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={openModal}
        className="text-xs text-primary hover:underline font-medium transition-colors"
      >
        اقتراح
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-card w-full max-w-lg rounded-xl border shadow-lg relative flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h3 className="font-semibold text-lg">اقتراح اختصار جديد</h3>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={closeModal}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto">
              <div className="space-y-2 bg-muted/50 p-4 rounded-lg border">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground block mb-1">المصطلح</span>
                  <p className="text-sm font-medium leading-relaxed">{term.term}</p>
                </div>
                
                {term.abbreviation && (
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground block mb-1">الاختصار الحالي</span>
                    <p className="text-sm font-mono bg-background border px-2 py-1 rounded w-fit">{term.abbreviation}</p>
                  </div>
                )}

                {term.description && (
                   <div>
                    <span className="text-xs font-semibold text-muted-foreground block mb-1">الشرح</span>
                    <p className="text-xs text-muted-foreground line-clamp-3">{term.description}</p>
                  </div>
                )}
              </div>

              {!success ? (
                <form onSubmit={submit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="proposal" className="text-sm font-medium">
                      الاختصار المقترح <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="proposal"
                      placeholder="اكتب الاختصار المقترح هنا..."
                      value={proposed}
                      onChange={(e) => setProposed(e.target.value)}
                      autoFocus
                    />
                  </div>
                  
                  {error && (
                    <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                      {error}
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={closeModal} disabled={loading}>
                      إلغاء
                    </Button>
                    <Button type="submit" disabled={loading || !proposed.trim()}>
                      {loading ? (
                        "جارٍ الإرسال..."
                      ) : (
                        <>
                          <span className="ml-2">إرسال المقترح</span>
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-3 animate-in fade-in slide-in-from-bottom-2">
                  <div className="h-12 w-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-2">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-green-700">تم إرسال الاقتراح بنجاح</h4>
                  <p className="text-sm text-muted-foreground">شكراً لمساهمتك! سيتم مراجعة اقتراحك من قبل المسؤولين.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
