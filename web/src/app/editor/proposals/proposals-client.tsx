"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Proposal = {
  id: number;
  proposedAbbreviation: string;
  createdAt: string;
  term: { id: number; term: string; abbreviation: string | null };
  createdBy: { id: number; username: string };
};

export default function ProposalsClient() {
  const [proposals, setProposals] = useState<Proposal[]>([]);

  async function load() {
    const res = await fetch("/api/editor/proposals");
    const data = await res.json();
    if (res.ok) setProposals(data.proposals || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function act(id: number, action: "approve" | "reject") {
    await fetch(`/api/editor/proposals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    await load();
  }

  return (
    <div className="space-y-4">
      {proposals.map((p) => (
        <Card key={p.id}>
          <CardContent className="pt-6 space-y-3">
            <div className="text-sm text-muted-foreground">
              المقترح بواسطة: {p.createdBy.username}
            </div>
            <div className="text-base font-semibold">{p.term.term}</div>
            <div className="text-sm">
              الاختصار الحالي: <span className="font-mono">{p.term.abbreviation || "-"}</span>
            </div>
            <div className="text-sm">
              الاختصار المقترح: <span className="font-mono">{p.proposedAbbreviation}</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => act(p.id, "approve")}>موافقة</Button>
              <Button size="sm" variant="outline" onClick={() => act(p.id, "reject")}>رفض</Button>
            </div>
          </CardContent>
        </Card>
      ))}
      {proposals.length === 0 && (
        <div className="rounded-lg border bg-card p-6 text-center text-muted-foreground">
          لا توجد طلبات حالياً.
        </div>
      )}
    </div>
  );
}
