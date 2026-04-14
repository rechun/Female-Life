"use client";

import { useEffect, useMemo, useState } from "react";
import { formatISO } from "date-fns";
import { uid } from "@/lib/id";
import type { ChatMessage, TodayPlan } from "@/lib/types";
import {
  hasOnboarded,
  loadChatHistory,
  loadCycleProfile,
  loadDailyCheckins,
  loadLifeSystemProfile,
  loadMentalLoad,
  loadTasks,
  saveChatHistory,
  saveTasks,
  saveTodayPlan
} from "@/lib/storage";
import { runOrchestrator } from "@/lib/agents/orchestrator";

export default function ChatPage() {
  const today = useMemo(() => formatISO(new Date(), { representation: "date" }), []);
  const [ready, setReady] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [lastPlan, setLastPlan] = useState<TodayPlan | null>(null);

  useEffect(() => {
    setReady(true);
    setMsgs(loadChatHistory());
  }, []);

  function runOnce(text: string) {
    const cycle = loadCycleProfile();
    if (!cycle) return null;
    const tasks = loadTasks();
    const checkin = loadDailyCheckins().find((x) => x.date === today);
    return runOrchestrator(
      { userText: text, chatHistory: msgs },
      {
        now: new Date(),
        cycleProfile: cycle,
        lifeSystemProfile: loadLifeSystemProfile(),
        mentalLoad: loadMentalLoad(),
        tasks,
        todayCheckin: checkin
      }
    );
  }

  function send() {
    const text = input.trim();
    if (!text) return;

    const nextMsgs: ChatMessage[] = [
      ...msgs,
      { id: uid("m"), role: "user", content: text, createdAt: new Date().toISOString() }
    ];

    const plan = runOnce(text);
    if (!plan) return;
    setLastPlan(plan);

    const assistantText =
      `我理解你现在的重点是：\n` +
      plan.top3.map((t, i) => `${i + 1}. ${t.title}（${t.priority === "must" ? "必须" : t.priority === "should" ? "最好" : "可选"}）`).join("\n") +
      `\n\n自我照顾建议：\n- ${plan.selfCare.join("\n- ")}` +
      `\n\n不建议做：\n- ${plan.avoid.slice(0, 3).join("\n- ")}`;

    nextMsgs.push({
      id: uid("m"),
      role: "assistant",
      content: assistantText,
      createdAt: new Date().toISOString()
    });

    setMsgs(nextMsgs);
    saveChatHistory(nextMsgs);
    setInput("");
  }

  function applyToToday() {
    if (!lastPlan) return;
    saveTodayPlan(today, lastPlan);
    // 落地任务
    const tasks = loadTasks();
    const titles = new Set(tasks.map((t) => t.title));
    const merged = [...tasks];
    for (const t of lastPlan.top3) if (!titles.has(t.title)) merged.unshift(t);
    saveTasks(merged);
    alert("已应用到 Today 面板");
  }

  if (!ready) return null;

  if (!hasOnboarded()) {
    return (
      <div className="rounded-lg border bg-white p-6">
        <div className="text-lg font-semibold">需要先建档</div>
        <div className="mt-2 text-sm text-neutral-600">请先去“建档”页填写周期与生活系统信息。</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-white p-5">
        <div className="font-semibold">对话入口（MVP）</div>
        <div className="mt-1 text-sm text-neutral-600">输入一句话，Orchestrator 会调用 Cycle/LifeAdmin 并输出可执行的 Today 建议。</div>
      </div>

      <div className="rounded-lg border bg-white p-5">
        <div className="space-y-3">
          {msgs.length === 0 ? <div className="text-sm text-neutral-600">暂无对话。试试输入：“我这周状态很差，周末还要处理家里事。”</div> : null}
          {msgs.map((m) => (
            <div key={m.id} className={m.role === "user" ? "text-right" : "text-left"}>
              <div
                className={
                  "inline-block max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm " +
                  (m.role === "user" ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-900")
                }
              >
                {m.content}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-2">
          <textarea
            className="h-20 w-full rounded border p-3 text-sm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="例如：我这周状态很差，周末还要陪妈妈复查，冰箱也快没东西了..."
          />
          <div className="flex items-center gap-3">
            <button onClick={send} className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800">
              发送
            </button>
            <button
              onClick={applyToToday}
              className="rounded border bg-white px-4 py-2 text-sm font-medium hover:bg-neutral-50"
              disabled={!lastPlan}
            >
              应用到 Today
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

