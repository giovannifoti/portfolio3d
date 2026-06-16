"use client";

import { useEffect } from "react";

export default function ViewTracker({ productId }: { productId: string }) {
  useEffect(() => {
    const key = `viewed:${productId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    fetch(`/api/products/${productId}/view`, { method: "POST" }).catch(() => undefined);
  }, [productId]);

  return null;
}
