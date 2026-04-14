"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { hasOnboarded } from "@/lib/storage";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (hasOnboarded()) router.replace("/today");
    else router.replace("/onboarding");
  }, [router]);

  return (
    <div className="rounded-lg border bg-white p-6">
      <div className="text-lg font-semibold">正在进入 Female Life OS…</div>
      <div className="mt-2 text-sm text-neutral-600">首次使用会先引导建档。</div>
    </div>
  );
}

