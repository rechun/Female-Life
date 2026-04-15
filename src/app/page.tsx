"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { hasOnboarded } from "@/lib/storage";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (hasOnboarded()) router.replace("/today");
    else router.replace("/onboarding");
  }, [router]);

  return (
    <Card>
      <CardContent>
        <CardTitle>正在进入 Female Life OS…</CardTitle>
        <CardDescription>首次使用会先引导建档。</CardDescription>
      </CardContent>
    </Card>
  );
}
