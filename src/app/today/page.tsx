"use client";

import { useEffect, useMemo, useState } from "react";
import { formatISO } from "date-fns";
import type { DailyCheckin, LifeTask, TodayPlan } from "@/lib/types";
import {
  hasOnboarded,
  loadCycleProfile,
  loadDailyCheckins,
  loadLifeSystemProfile,
  loadMentalLoad,
  loadTasks,
  loadTodayPlan,
  saveTasks,
  saveTodayPlan,
  upsertDailyCheckin
} from "@/lib/storage";
import { runOrchestrator } from "@/lib/agents/orchestrator";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-white p-5">
      <div className="font-semibold">{title}</div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export default function TodayPage() {
  const today = useMemo(() => formatISO(new Date(), { representation: "date" }), []);

  const [ready, setReady] = useState(false);
  const [text, setText] = useState("我今天有点累，但又不想把事情完全停掉。");
  const [plan, setPlan] = useState<TodayPlan | null>(null);

  const [sleepQuality, setSleepQuality] = useState<DailyCheckin["sleepQuality"]>(3);
  const [fatigue, setFatigue] = useState<DailyCheckin["fatigue"]>(3);
  const [mood, setMood] = useState<DailyCheckin["mood"]>(3);

  useEffect(() => {
    setReady(true);
    const saved = loadTodayPlan(today);
    if (saved) setPlan(saved);
    const checkins = loadDailyCheckins();
    const c = checkins.find((x) => x.date === today);
    if (c?.sleepQuality) setSleepQuality(c.sleepQuality);
    if (c?.fatigue) setFatigue(c.fatigue);
    if (c?.mood) setMood(c.mood);
  }, [today]);

  function generate() {
    const cycle = loadCycleProfile();
    if (!cycle) return;
    const tasks = loadTasks();
    const ctx = {
      now: new Date(),
      cycleProfile: cycle,
      lifeSystemProfile: loadLifeSystemProfile(),
      mentalLoad: loadMentalLoad(),
      tasks,
      todayCheckin: {
        date: today,
        sleepQuality: sleepQuality ?? 3,
        fatigue: fatigue ?? 3,
        mood: mood ?? 3
      }
    };

    const next = runOrchestrator({ userText: text }, ctx);
    setPlan(next);
    saveTodayPlan(today, next);
    upsertDailyCheckin(ctx.todayCheckin);

    // 把 top3 任务落地到 tasks（便于跨页面展示）
    const titles = new Set(tasks.map((t) => t.title));
    const merged: LifeTask[] = [...tasks];
    for (const t of next.top3) {
      if (!titles.has(t.title)) merged.unshift(t);
    }
    saveTasks(merged);
  }

  function markDone(taskTitle: string) {
    const all = loadTasks().map((t) => (t.title === taskTitle ? { ...t, status: "done" as const } : t));
    saveTasks(all);
    if (plan) {
      const next = { ...plan, top3: plan.top3.map((t) => (t.title === taskTitle ? { ...t, status: "done" as const } : t)) };
      setPlan(next);
      saveTodayPlan(today, next);
    }
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
      <Section title="快速打点（用于更准确的节律判断）">
        <div className="grid gap-3 text-sm md:grid-cols-3">
          <label className="grid gap-1">
            <span className="text-neutral-600">睡眠质量</span>
            <select className="rounded border px-3 py-2" value={sleepQuality} onChange={(e) => setSleepQuality(Number(e.target.value) as any)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-neutral-600">疲劳</span>
            <select className="rounded border px-3 py-2" value={fatigue} onChange={(e) => setFatigue(Number(e.target.value) as any)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-neutral-600">情绪</span>
            <select className="rounded border px-3 py-2" value={mood} onChange={(e) => setMood(Number(e.target.value) as any)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Section>

      <Section title="一句话进入（对话式入口）">
        <div className="grid gap-3">
          <textarea className="h-24 w-full rounded border p-3 text-sm" value={text} onChange={(e) => setText(e.target.value)} />
          <div className="flex items-center gap-3">
            <button onClick={generate} className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800">
              生成 Today 面板
            </button>
            <div className="text-sm text-neutral-600">提示：包含“很累/不想动”等会自动进入低能量收缩模式。</div>
          </div>
        </div>
      </Section>

      <Section title="Today 面板（系统输出）">
        {!plan ? (
          <div className="text-sm text-neutral-600">点击“生成 Today 面板”后，这里会出现卡片化结果。</div>
        ) : (
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded border p-4">
                <div className="text-sm font-semibold">今日状态</div>
                <div className="mt-2 text-sm text-neutral-700">
                  节律：{plan.cyclePhaseLabel} · {plan.energy === "high" ? "高能量" : plan.energy === "mid" ? "中等能量" : "低能量"}
                </div>
                <div className="mt-2 text-sm text-neutral-700">风险：{plan.risks.length ? plan.risks.join("、") : "无明显风险"}</div>
              </div>
              <div className="rounded border p-4">
                <div className="text-sm font-semibold">自我照顾建议</div>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-700">
                  {plan.selfCare.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded border p-4">
              <div className="text-sm font-semibold">今日重点 1–3 件事</div>
              <div className="mt-2 space-y-2">
                {plan.top3.map((t) => (
                  <div key={t.id} className="flex items-start justify-between gap-3 rounded border bg-neutral-50 p-3">
                    <div>
                      <div className="text-sm font-medium">{t.title}</div>
                      <div className="mt-1 text-xs text-neutral-600">
                        {t.priority === "must" ? "必须做" : t.priority === "should" ? "最好做" : "可选做"}
                      </div>
                    </div>
                    <button
                      className="rounded border bg-white px-3 py-1 text-xs hover:bg-neutral-100"
                      onClick={() => markDone(t.title)}
                      disabled={t.status === "done"}
                    >
                      {t.status === "done" ? "已完成" : "标记完成"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded border p-4">
              <div className="text-sm font-semibold">提醒事项（简版）</div>
              <div className="mt-2 space-y-2 text-sm text-neutral-700">
                {plan.cards.filter((c) => c.cardType === "reminder").length === 0 ? (
                  <div className="text-sm text-neutral-600">暂无提醒（可在建档里补充固定缴费/补货清单）。</div>
                ) : (
                  plan.cards
                    .filter((c) => c.cardType === "reminder")
                    .map((c) => (
                      <div key={c.id} className="rounded border bg-white p-3">
                        <div className="font-medium">{c.title}</div>
                        {c.body ? <div className="mt-1 text-neutral-600">{c.body}</div> : null}
                      </div>
                    ))
                )}
              </div>
            </div>

            <div className="rounded border p-4">
              <div className="text-sm font-semibold">卡片（用于作品展示）</div>
              <div className="mt-2 grid gap-2">
                {plan.cards.map((c) => (
                  <div key={c.id} className="rounded border bg-white p-3">
                    <div className="text-sm font-medium">{c.title}</div>
                    {c.body ? <div className="mt-1 text-sm text-neutral-700">{c.body}</div> : null}
                    {typeof c.confidence === "number" ? (
                      <div className="mt-1 text-xs text-neutral-500">置信度：{Math.round(c.confidence * 100)}%</div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Section>
    </div>
  );
}
