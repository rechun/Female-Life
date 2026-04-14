"use client";

import { useEffect, useMemo, useState } from "react";
import { uid } from "@/lib/id";
import type { MentalLoadItem } from "@/lib/types";
import { hasOnboarded, loadMentalLoad, saveMentalLoad } from "@/lib/storage";

function chip(text: string) {
  return <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-700">{text}</span>;
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
      <div className="rounded-lg border bg-white p-6">
        <div className="text-lg font-semibold">需要先建档</div>
        <div className="mt-2 text-sm text-neutral-600">请先去“建档”页生成基础的生活系统档案。</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-semibold">Mental Load Board（隐形劳动面板）</div>
            <div className="mt-1 text-sm text-neutral-600">
              把“持续的小事务”显性化，并标注：可委派 / 可自动化 / 受影响者 / 承担者。
            </div>
          </div>
          <button onClick={addQuick} className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800">
            + 新增
          </button>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-5">
        <div className="text-sm text-neutral-700">
          当前 active：<span className="font-semibold">{active.length}</span> 项
        </div>
      </div>

      <div className="grid gap-3">
        {active.length === 0 ? (
          <div className="rounded-lg border bg-white p-6 text-sm text-neutral-600">暂无 active 事项。你可以点击“新增”。</div>
        ) : null}

        {active.map((x) => (
          <div key={x.id} className="rounded-lg border bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">{x.title}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {chip(x.category)}
                  {chip(`影响：${x.impactScope}`)}
                  {chip(`承担：${x.assignee}`)}
                  {x.delegable ? chip("可委派") : chip("不可委派")}
                  {x.automatable ? chip("可自动化") : chip("不可自动化")}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button className="rounded border bg-white px-3 py-1 text-xs hover:bg-neutral-50" onClick={() => toggle(x.id, "delegable")}>
                  切换委派
                </button>
                <button className="rounded border bg-white px-3 py-1 text-xs hover:bg-neutral-50" onClick={() => toggle(x.id, "automatable")}>
                  切换自动化
                </button>
                <button className="rounded border bg-white px-3 py-1 text-xs hover:bg-neutral-50" onClick={() => delegateTemplate(x)} disabled={!x.delegable}>
                  生成委派话术
                </button>
                <button className="rounded border bg-white px-3 py-1 text-xs hover:bg-neutral-50" onClick={() => setStatus(x.id, "done")}>
                  标记已处理
                </button>
                <button className="rounded border bg-white px-3 py-1 text-xs hover:bg-neutral-50" onClick={() => setStatus(x.id, "muted")}>
                  从面板隐藏
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

