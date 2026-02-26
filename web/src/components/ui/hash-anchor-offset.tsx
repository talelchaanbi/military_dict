"use client";

import { useEffect } from "react";

export function HashAnchorOffset({
  anchorId,
  offset = 170,
}: {
  anchorId?: string | null;
  offset?: number;
}) {
  useEffect(() => {
    if (!anchorId) return;

    const scrollToAnchor = () => {
      const target = document.getElementById(anchorId);
      if (!target) return;

      const y = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: Math.max(0, y), behavior: "auto" });
    };

    scrollToAnchor();
    const t1 = window.setTimeout(scrollToAnchor, 120);
    const t2 = window.setTimeout(scrollToAnchor, 450);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [anchorId, offset]);

  return null;
}
