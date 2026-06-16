"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export default function ProductShare({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={copyLink}
      className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-black/10 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-950 hover:text-white dark:border-white/10 dark:text-white dark:hover:bg-white dark:hover:text-zinc-950"
    >
      {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
      {copied ? "Link copiato" : "Copia link"}
    </button>
  );
}
