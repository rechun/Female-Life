"use client";

import { useEffect, useMemo, useState } from "react";
import { formatISO } from "date-fns";
import { uid } from "@/lib/id";
import type { ChatMessage, TodayPlan } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
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
      <PageHeader title="需要先建档" description="请先去“建档”页填写周期与生活系统信息。" />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Chat" description="一句话把今天说清楚：Orchestrator 会输出可执行的 Today 建议，并支持一键应用。" />

      <Card>
        <CardContent>
          <div className="space-y-3">
          {msgs.length === 0 ? <div className="text-sm text-flo-text-secondary">暂无对话。试试输入：“我这周状态很差，周末还要处理家里事。”</div> : null}
          {msgs.map((m) => (
            <div key={m.id} className={m.role === "user" ? "text-right" : "text-left"}>
              <div
                className={
                  "inline-block max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed " +
                  (m.role === "user"
                    ? "bg-flo-bg-inverted text-[rgba(236,233,224,0.96)]"
                    : "border border-flo-border bg-[rgba(245,243,236,0.65)] text-flo-text-primary")
                }
              >
                {m.content}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-2">
          <Textarea
            className="h-24"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="例如：我这周状态很差，周末还要陪妈妈复查，冰箱也快没东西了..."
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="primary" onClick={send}>
              发送
            </Button>
            <Button variant="secondary" onClick={applyToToday} disabled={!lastPlan}>
              应用到 Today
            </Button>
          </div>
        </div>
        </CardContent>
      </Card>
    </div>
  );
}
