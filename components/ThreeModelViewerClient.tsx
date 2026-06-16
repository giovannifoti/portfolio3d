"use client";

import dynamic from "next/dynamic";

const ThreeModelViewer = dynamic(() => import("@/components/ThreeModelViewer"), {
  ssr: false,
  loading: () => <div className="h-[420px] w-full rounded-lg bg-zinc-100 dark:bg-zinc-900 sm:h-[540px]" />,
});

export default ThreeModelViewer;
