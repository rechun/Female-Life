"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatISO } from "date-fns";
import { uid } from "@/lib/id";
import type { CycleProfile, LifeSystemProfile, MentalLoadItem, UserProfile } from "@/lib/types";
import {
  loadCycleProfile,
  loadLifeSystemProfile,
  loadUserProfile,
  saveCycleProfile,
  saveLifeSystemProfile,
  saveMentalLoad,
  saveTasks,
  saveUserProfile
} from "@/lib/storage";

export default function OnboardingPage() {
  const router = useRouter();
  const today = useMemo(() => formatISO(new Date(), { representation: "date" }), []);

  const [ageRange, setAgeRange] = useState<UserProfile["ageRange"]>(() => loadUserProfile()?.ageRange ?? "25-30");
  const [workStyle, setWorkStyle] = useState<UserProfile["workStyle"]>(() => loadUserProfile()?.workStyle ?? "9-6");
  const [sleepPref, setSleepPref] = useState<UserProfile["sleepPreference"]>(() => loadUserProfile()?.sleepPreference ?? "night_owl");

  const [lastPeriodStart, setLastPeriodStart] = useState(() => loadCycleProfile()?.lastPeriodStart ?? today);
  const [cycleLen, setCycleLen] = useState(() => String(loadCycleProfile()?.avgCycleLength ?? 28));
  const [symptoms, setSymptoms] = useState(() => (loadCycleProfile()?.symptoms ?? ["易疲劳", "易烦躁"]).join("、"));

  const [staples, setStaples] = useState(() =>
    (loadLifeSystemProfile()?.staples ?? [
      { title: "纸巾", typicalDays: 20 },
      { title: "猫粮", typicalDays: 25 }
    ])
      .map((x) => `${x.title}:${x.typicalDays}`)
      .join("\n")
  );

  const [bills, setBills] = useState(() =>
    (loadLifeSystemProfile()?.recurringBills ?? [
      { title: "宽带", rule: "monthly", dayOfMonth: 10 },
      { title: "房租", rule: "monthly", dayOfMonth: 1 }
    ])
      .map((x) => `${x.title}:${x.rule}:${x.dayOfMonth ?? ""}`)
      .join("\n")
  );

  function buildMentalLoad(ls: LifeSystemProfile): MentalLoadItem[] {
    const items: MentalLoadItem[] = [];
    for (const s of ls.staples ?? []) {
      items.push({
        id: uid("ml"),
        title: s.title,
        category: "采购补货",
        impactScope: "家庭",
        assignee: "我",
        delegable: true,
        automatable: true,
        status: "active"
      });
    }
    for (const b of ls.recurringBills ?? []) {
      items.push({
        id: uid("ml"),
        title: b.title,
        category: "缴费续期",
        impactScope: "家庭",
        assignee: "我",
        delegable: false,
        automatable: true,
        status: "active"
      });
    }
    return items;
  }

  function parseStaples(text: string): LifeSystemProfile["staples"] {
    return text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        const [title, days] = l.split(":");
        return { title: (title ?? "").trim(), typicalDays: Number(days ?? 21) || 21 };
      })
      .filter((x) => x.title.length > 0);
  }

  function parseBills(text: string): LifeSystemProfile["recurringBills"] {
    return text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        const [title, rule, day] = l.split(":");
        const d = day ? Number(day) : undefined;
        return { title: (title ?? "").trim(), rule: (rule as any) ?? "monthly", dayOfMonth: d && d > 0 ? d : undefined };
      })
      .filter((x) => x.title.length > 0);
  }

  function onSave() {
    const user: UserProfile = {
      userId: uid("user"),
      createdAt: new Date().toISOString(),
      ageRange,
      workStyle,
      sleepPreference: sleepPref,
      quietHours: { start: "22:30", end: "08:00" }
    };
    const cycle: CycleProfile = {
      lastPeriodStart,
      avgCycleLength: Math.min(60, Math.max(20, Number(cycleLen) || 28)),
      symptoms: symptoms
        .split("、")
        .map((x) => x.trim())
        .filter(Boolean)
    };
    const lifeSystem: LifeSystemProfile = {
      staples: parseStaples(staples),
      recurringBills: parseBills(bills)
    };

    saveUserProfile(user);
    saveCycleProfile(cycle);
    saveLifeSystemProfile(lifeSystem);
    saveMentalLoad(buildMentalLoad(lifeSystem));
    saveTasks([]); // 作品展示：先清空，交给 Orchestrator 生成
    router.push("/today");
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-white p-6">
        <div className="text-lg font-semibold">初始建档（MVP）</div>
        <div className="mt-1 text-sm text-neutral-600">
          目标：3 分钟内完成建档，并立刻生成第一张 Today 面板。数据仅保存在本地浏览器。
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-white p-5">
          <div className="font-semibold">个人档案</div>
          <div className="mt-3 grid gap-3 text-sm">
            <label className="grid gap-1">
              <span className="text-neutral-600">年龄段</span>
              <select className="rounded border px-3 py-2" value={ageRange} onChange={(e) => setAgeRange(e.target.value as any)}>
                <option value="18-24">18–24</option>
                <option value="25-30">25–30</option>
                <option value="31-38">31–38</option>
                <option value="39+">39+</option>
              </select>
            </label>

            <label className="grid gap-1">
              <span className="text-neutral-600">工作/生活节奏</span>
              <select className="rounded border px-3 py-2" value={workStyle} onChange={(e) => setWorkStyle(e.target.value as any)}>
                <option value="9-6">朝九晚六</option>
                <option value="flex">弹性/自由</option>
                <option value="student">学生</option>
                <option value="shift">轮班</option>
              </select>
            </label>

            <label className="grid gap-1">
              <span className="text-neutral-600">作息偏好</span>
              <select className="rounded border px-3 py-2" value={sleepPref} onChange={(e) => setSleepPref(e.target.value as any)}>
                <option value="early">早睡型</option>
                <option value="night_owl">夜猫子</option>
              </select>
            </label>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-5">
          <div className="font-semibold">周期档案</div>
          <div className="mt-3 grid gap-3 text-sm">
            <label className="grid gap-1">
              <span className="text-neutral-600">上次经期开始</span>
              <input className="rounded border px-3 py-2" type="date" value={lastPeriodStart} onChange={(e) => setLastPeriodStart(e.target.value)} />
            </label>

            <label className="grid gap-1">
              <span className="text-neutral-600">平均周期长度（天）</span>
              <input className="rounded border px-3 py-2" value={cycleLen} onChange={(e) => setCycleLen(e.target.value)} />
            </label>

            <label className="grid gap-1">
              <span className="text-neutral-600">常见症状（用“、”分隔）</span>
              <input className="rounded border px-3 py-2" value={symptoms} onChange={(e) => setSymptoms(e.target.value)} />
            </label>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-white p-5">
          <div className="font-semibold">生活系统档案：常用补货（staples）</div>
          <div className="mt-1 text-sm text-neutral-600">每行：物品:建议间隔天数（例如：纸巾:20）</div>
          <textarea className="mt-3 h-40 w-full rounded border p-3 text-sm" value={staples} onChange={(e) => setStaples(e.target.value)} />
        </div>

        <div className="rounded-lg border bg-white p-5">
          <div className="font-semibold">生活系统档案：固定缴费/续费（bills）</div>
          <div className="mt-1 text-sm text-neutral-600">每行：名称:monthly:到期日（例如：宽带:monthly:10）</div>
          <textarea className="mt-3 h-40 w-full rounded border p-3 text-sm" value={bills} onChange={(e) => setBills(e.target.value)} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={onSave} className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800">
          保存并生成 Today 面板
        </button>
        <div className="text-sm text-neutral-600">提示：你随时可以回来修改建档信息。</div>
      </div>
    </div>
  );
}

