"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Term = {
  id: number;
  term: string;
  abbreviation: string | null;
  description: string | null;
};

export default function ProposalClient({ term }: { term: Term }) {
  const router = useRouter();
  const [proposed, setProposed] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError(null);
    setLoading(true);
    const res = await fetch("/api/proposals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ termId: term.id, proposedAbbreviation: proposed }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "تعذر إرسال الطلب");
      return;
    }

    router.push(`/sections`);
    router.refresh();
  }

  return (
    <div className="max-w-xl space-y-4">
      <Card>
        <CardContent className="pt-6 space-y-2">
          <div className="text-lg font-semibold">{term.term}</div>
          <div className="text-sm text-muted-foreground">{term.description || ""}</div>
          <div className="text-sm">
            الاختصار الحالي: <span className="font-mono">{term.abbreviation || "-"}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <Input
            placeholder="الاختصار المقترح"
            value={proposed}
            onChange={(e) => setProposed(e.target.value)}
          />
          {error && <div className="text-sm text-red-600">{error}</div>}
          <Button onClick={submit} disabled={loading || !proposed.trim()}>
            {loading ? "..." : "إرسال الطلب"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
