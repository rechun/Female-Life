import { formatISO } from "date-fns";
import type {
  Card,
  ChatMessage,
  CycleProfile,
  DailyCheckin,
  LifeSystemProfile,
  LifeTask,
  MentalLoadItem,
  TodayPlan
} from "../types";
import { uid } from "../id";
import { assessCycle } from "./cycleAgent";
import { runLifeAdmin } from "./lifeAdminAgent";

export type OrchestratorContext = {
  now: Date;
  cycleProfile: CycleProfile;
  lifeSystemProfile: LifeSystemProfile | null;
  mentalLoad: MentalLoadItem[];
  tasks: LifeTask[];
  todayCheckin?: DailyCheckin;
};

export type OrchestratorInput = {
  userText: string;
  chatHistory?: ChatMessage[];
};

function pickTop(tasks: LifeTask[], max = 3): LifeTask[] {
  const order: Record<LifeTask["priority"], number> = { must: 0, should: 1, optional: 2 };
  return tasks
    .filter((t) => t.status !== "done")
    .sort((a, b) => order[a.priority] - order[b.priority])
    .slice(0, max);
}

function detectLowEnergyHint(text: string): boolean {
  const s = text.trim();
  return /好累|很累|不想动|状态很差|崩|撑不住|没力气/.test(s);
}

function extractAdhocTasks(text: string, now: Date): LifeTask[] {
  const out: LifeTask[] = [];
  const add = (title: string, priority: LifeTask["priority"], category: LifeTask["category"]) => {
    out.push({
      id: uid("task"),
      title,
      category,
      priority,
      status: "todo",
      createdAt: now.toISOString()
    });
  };

  if (/复查|体检|挂号|看医生|医院/.test(text) && /妈|妈妈|父母|爸/.test(text)) {
    add("安排：家人复查/就诊（周末/本周）", "must", "照护支持");
  }
  if (/缴费|续费|到期|水电|房租|宽带|会员/.test(text)) {
    add("处理：本周缴费/续费事项", "must", "缴费续期");
  }
  if (/补货|没东西|快没了|下单|冰箱|纸巾|猫粮|买菜/.test(text)) {
    add("下单：家庭补货（按清单）", "should", "采购补货");
  }
  if (/学习|复习|课程|训练|阅读/.test(text)) {
    add("成长：20 分钟轻学习（不中断）", "optional", "成长");
  }
  if (/汇报|方案|deadline|项目|会议/.test(text)) {
    add("工作：推进关键任务（拆成最小动作）", "must", "工作学习");
  }

  // 去重（title）
  const dedup = new Map<string, LifeTask>();
  for (const t of out) dedup.set(t.title, t);
  return [...dedup.values()];
}

export function runOrchestrator(input: OrchestratorInput, ctx: OrchestratorContext): TodayPlan {
  const date = formatISO(ctx.now, { representation: "date" });

  const cycle = assessCycle(ctx.cycleProfile, ctx.now, ctx.todayCheckin);
  const lifeAdmin = runLifeAdmin(ctx.lifeSystemProfile, ctx.mentalLoad, ctx.tasks, ctx.now);

  // 用户文本的低能量暗示：用于收缩 Today 输出（不直接改写 cycle 评估）
  const lowHint = detectLowEnergyHint(input.userText);

  const adhoc = extractAdhocTasks(input.userText, ctx.now);
  const mergedCandidates = [
    ...adhoc,
    ...lifeAdmin.proposedTasks,
    ...ctx.tasks.filter((t) => t.status !== "done")
  ];

  // low 模式：只保留 must + 1 个 should（如果有），避免压垮
  const top = (() => {
    const must = mergedCandidates.filter((t) => t.priority === "must");
    const should = mergedCandidates.filter((t) => t.priority === "should");
    const optional = mergedCandidates.filter((t) => t.priority === "optional");
    const dedup = new Map<string, LifeTask>();
    for (const t of [...must, ...should, ...optional]) dedup.set(t.title, t);
    const all = [...dedup.values()];
    if (!lowHint && cycle.energy !== "low") return pickTop(all, 3);
    const picked: LifeTask[] = [];
    picked.push(...pickTop(all.filter((t) => t.priority === "must"), 2));
    if (picked.length < 3) picked.push(...pickTop(all.filter((t) => t.priority === "should"), 1));
    if (picked.length < 3) picked.push(...pickTop(all.filter((t) => t.priority === "optional"), 1));
    return picked.slice(0, 3);
  })();

  const cards: Card[] = [];
  cards.push({
    id: uid("card"),
    cardType: "status",
    title: `今日节律：${cycle.phaseLabel} · ${cycle.energy === "high" ? "高能量" : cycle.energy === "mid" ? "中等能量" : "低能量"}`,
    body: `${cycle.notes[0] ?? ""}`.trim() || undefined,
    confidence: cycle.confidence
  });

  for (const r of cycle.risks) {
    const map: Record<string, string> = {
      irritability: "情绪风险：易烦躁",
      anxiety: "情绪风险：焦虑/紧绷",
      overload: "过载风险：请减少加塞",
      sleep_debt: "睡眠债：建议安排恢复"
    };
    cards.push({
      id: uid("card"),
      cardType: "risk",
      title: map[r] ?? `风险：${r}`
    });
  }

  for (const t of top) {
    cards.push({
      id: uid("card"),
      cardType: "task",
      title: t.title,
      body:
        t.priority === "must"
          ? "必须做（有外部约束/风险）"
          : t.priority === "should"
            ? "最好做（能显著减负）"
            : "可选做（维持连续性）",
      actions: [
        { type: "done", label: "完成", taskId: t.id },
        { type: "snooze", label: "延后 4h", taskId: t.id, minutes: 240 },
        { type: "open", label: "去 Mental Load", href: "/mental-load" }
      ]
    });
  }

  for (const r of lifeAdmin.reminders.slice(0, 5)) {
    cards.push({
      id: uid("card"),
      cardType: "reminder",
      title: r.title,
      body: r.reason
    });
  }

  for (const n of lifeAdmin.notes.slice(0, 2)) {
    cards.push({ id: uid("card"), cardType: "suggestion", title: "生活行政提示", body: n });
  }

  const selfCare = cycle.energy === "low" || lowHint
    ? ["下午安排 30–45 分钟恢复（散步/小睡/无输入）", "晚上减少信息摄入，避免情绪放大"]
    : ["给自己留出 1 个不被打扰的专注块", "把沟通集中到一个时间段完成"];

  return {
    date,
    energy: cycle.energy,
    cyclePhaseLabel: cycle.phaseLabel,
    risks: cycle.risks,
    focus: cycle.focus,
    avoid: cycle.avoid,
    top3: top,
    selfCare,
    cards
  };
}
