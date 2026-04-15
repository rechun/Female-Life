"use client";

import { useEffect, useMemo, useState } from "react";
import { uid } from "@/lib/id";
import type { MentalLoadItem } from "@/lib/types";
import { hasOnboarded, loadMentalLoad, saveMentalLoad } from "@/lib/storage";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function chip(text: string) {
  return <Badge>{text}</Badge>;
}

export default function MentalLoadPage() {
  const [ready, setReady] = useState(false);
  const [items, setItems] = useState<MentalLoadItem[]>([]);

  useEffect(() => {
    setReady(true);
    setItems(loadMentalLoad());
  }, []);

  const active = useMemo(() => items.filter((x) => x.status === "active"), [items]);

  function update(next: MentalLoadItem[]) {
    setItems(next);
    saveMentalLoad(next);
  }

  function toggle(id: string, k: "delegable" | "automatable") {
    update(items.map((x) => (x.id === id ? { ...x, [k]: !x[k] } : x)));
  }

  function setStatus(id: string, status: MentalLoadItem["status"]) {
    update(items.map((x) => (x.id === id ? { ...x, status } : x)));
  }

  function delegateTemplate(item: MentalLoadItem) {
    const who = item.assignee === "我" ? "你" : item.assignee;
    const text =
      `想和你同步一下家里的事项：\n` +
      `- ${item.title}\n\n` +
      `你这周方便负责一下吗？如果不方便我也可以处理，但想先确认一下分工。`;
    navigator.clipboard?.writeText(text);
    alert("已复制委派消息模板到剪贴板");
  }

  function addQuick() {
    const title = prompt("新增隐形事务（例如：预约洗牙/买猫砂/缴物业费）");
    if (!title) return;
    const next: MentalLoadItem = {
      id: uid("ml"),
      title,
      category: "预约安排",
      impactScope: "家庭",
      assignee: "我",
      delegable: true,
      automatable: false,
      status: "active"
    };
    update([next, ...items]);
  }

  if (!ready) return null;

  if (!hasOnboarded()) {
    return (
      <PageHeader title="需要先建档" description="请先去“建档”页生成基础的生活系统档案。" />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mental Load"
        description="把持续的小事务显性化，并标注：可委派 / 可自动化 / 受影响者 / 承担者。"
        actions={
          <Button variant="primary" onClick={addQuick}>
            + 新增
          </Button>
        }
      />

      <Card>
        <CardContent>
          <div className="text-sm text-flo-text-secondary">
            当前 active：<span className="font-semibold text-flo-text-primary">{active.length}</span> 项
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {active.length === 0 ? (
          <Card>
            <CardContent>
              <div className="text-sm text-flo-text-secondary">暂无 active 事项。你可以点击“新增”。</div>
            </CardContent>
          </Card>
        ) : null}

        {active.map((x) => (
          <Card key={x.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-flo-text-primary">{x.title}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {chip(x.category)}
                  {chip(`影响：${x.impactScope}`)}
                  {chip(`承担：${x.assignee}`)}
                  {x.delegable ? chip("可委派") : chip("不可委派")}
                  {x.automatable ? chip("可自动化") : chip("不可自动化")}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" onClick={() => toggle(x.id, "delegable")}>
                  切换委派
                </Button>
                <Button size="sm" onClick={() => toggle(x.id, "automatable")}>
                  切换自动化
                </Button>
                <Button size="sm" variant="secondary" onClick={() => delegateTemplate(x)} disabled={!x.delegable}>
                  生成委派话术
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setStatus(x.id, "done")}>
                  标记已处理
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setStatus(x.id, "muted")}>
                  从面板隐藏
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
